import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FinanzasService } from '../../services/finanzas.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MensajeErrorComponent } from '../../../../compartido/componentes/mensaje-error/mensaje-error';
import { CondominioService } from '../../../condominio/services/condominio.service';
import { IncidenciasService } from '../../../incidencias/services/incidencias.service';
import { CondominioResponse } from '../../../condominio/modelos/condominio-response.interface';
import { IncidenciaResponse } from '../../../incidencias/modelos/incidencia-response';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';

@Component({
  selector: 'app-formulario-gasto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MensajeErrorComponent],
  templateUrl: './formulario-gasto.html',
  styleUrl: './formulario-gasto.scss'
})
export class FormularioGastoComponent implements OnInit {
  formulario: FormGroup;
  esEdicion = false;
  gastoId: number | null = null;
  cargando = false;
  error: string | null = null;

  condominios: CondominioResponse[] = [];
  incidencias: IncidenciaResponse[] = [];

  constructor(
    private fb: FormBuilder,
    private finanzasService: FinanzasService,
    private condominioService: CondominioService,
    private incidenciasService: IncidenciasService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.formulario = this.fb.group({
      descripcion: ['', [Validators.required]],
      tipoGasto: ['FIJO', [Validators.required]],
      metodoDistribucion: ['PARTES_IGUALES', [Validators.required]],
      montoTotal: [0, [Validators.required, Validators.min(0.01)]],
      fechaLimite: [''],
      condominioId: ['', [Validators.required]],
      torre: [''],
      incidenciaId: [null]
    });
  }

  ngOnInit(): void {
    this.cargarCondominios();
    
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.esEdicion = true;
      this.gastoId = +idParam;
      this.cargarGasto(this.gastoId);
    }

    this.formulario.get('condominioId')?.valueChanges.subscribe(condominioId => {
      if (condominioId) {
        this.cargarIncidencias(Number(condominioId));
      } else {
        this.incidencias = [];
      }
    });
  }

  cargarCondominios(): void {
    this.condominioService.obtenerListaCondominios(0, 1000).subscribe({
      next: (resp) => this.condominios = resp.contenido,
      error: () => this.toastService.mostrarError('Error al cargar condominios')
    });
  }

  cargarIncidencias(condominioId: number): void {
    this.incidenciasService.obtenerListaPorEstado(undefined, undefined, 0, 1000).subscribe({
      next: (resp) => {
        this.incidencias = resp.contenido.filter(inc => inc.condominioId === condominioId);
      },
      error: () => this.toastService.mostrarError('Error al cargar incidencias')
    });
  }

  cargarGasto(id: number): void {
    this.finanzasService.obtenerGasto(id).subscribe({
      next: (gasto) => this.formulario.patchValue(gasto),
      error: () => this.error = 'Error al cargar el gasto'
    });
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    
    this.cargando = true;
    const datos = { ...this.formulario.value };
    
    if (datos.tipoGasto === 'FIJO') {
      datos.incidenciaId = null;
    }
    
    const request = this.esEdicion && this.gastoId
      ? this.finanzasService.actualizarGasto(this.gastoId, datos)
      : this.finanzasService.registrarGasto(datos);

    request.subscribe({
      next: () => {
        this.cargando = false;
        this.toastService.mostrarExito(this.esEdicion ? 'Gasto actualizado exitosamente' : 'Gasto registrado exitosamente');
        this.router.navigate(['/finanzas/gastos']);
      },
      error: (err) => {
        const mensajeError = err.error?.error || 'Ocurrió un error al guardar';
        this.toastService.mostrarError(mensajeError);
        this.cargando = false;
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/finanzas/gastos']);
  }
}
