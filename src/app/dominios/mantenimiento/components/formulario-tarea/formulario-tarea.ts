import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { MantenimientoService } from '../../services/mantenimiento.service';
import { SaludAmbientalService } from '../../../salud-ambiental/services/salud-ambiental.service';
import { CondominioService } from '../../../condominio/services/condominio.service';
import { CondominioResponse } from '../../../condominio/modelos/condominio-response.interface';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';
import { InsumoResponse } from '../../modelos/insumo.model';
import { AreaComunResponse } from '../../../areascomunes/modelos/area-comun-response';
import { MensajeErrorComponent } from '../../../../compartido/componentes/mensaje-error/mensaje-error';

@Component({
  selector: 'app-formulario-tarea',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MensajeErrorComponent],
  templateUrl: './formulario-tarea.html',
  styleUrls: ['./formulario-tarea.scss']
})
export class FormularioTareaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private mantenimientoService = inject(MantenimientoService);
  private saludAmbientalService = inject(SaludAmbientalService);
  private condominioService = inject(CondominioService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  formulario: FormGroup;
  condominios: CondominioResponse[] = [];
  areasComunes: AreaComunResponse[] = [];
  insumosDisponibles: InsumoResponse[] = [];
  guardando = false;

  constructor() {
    this.formulario = this.fb.group({
      condominioId: ['', Validators.required],
      areaComunId: [{ value: '', disabled: true }, Validators.required],
      descripcion: ['', [Validators.required, Validators.maxLength(200)]],
      fechaProgramada: ['', Validators.required],
      usosInsumos: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.cargarInsumos();
    this.cargarCondominios();

    this.formulario.get('condominioId')?.valueChanges.subscribe(condominioId => {
      this.formulario.get('areaComunId')?.setValue('');
      this.areasComunes = [];
      if (condominioId) {
        this.formulario.get('areaComunId')?.enable();
        this.cargarAreasComunes(condominioId);
      } else {
        this.formulario.get('areaComunId')?.disable();
      }
    });
  }

  private cargarCondominios(): void {
    this.condominioService.obtenerListaCondominios(0, 1000).subscribe({
      next: (res) => this.condominios = res.contenido,
      error: () => this.toastService.mostrarError('Error al cargar condominios')
    });
  }

  private cargarInsumos(): void {
    this.mantenimientoService.listarInsumos().subscribe({
      next: (insumos) => this.insumosDisponibles = insumos,
      error: () => this.toastService.mostrarError('Error al cargar insumos')
    });
  }

  private cargarAreasComunes(condominioId: number): void {
    this.saludAmbientalService.obtenerAreasComunesPorCondominio(condominioId).subscribe({
      next: (areas: AreaComunResponse[]) => this.areasComunes = areas,
      error: () => this.toastService.mostrarError('Error al cargar áreas comunes')
    });
  }

  get usosInsumos(): FormArray {
    return this.formulario.get('usosInsumos') as FormArray;
  }

  agregarUsoInsumo(): void {
    this.usosInsumos.push(this.fb.group({
      insumoId: ['', Validators.required],
      cantidadUsada: [1, [Validators.required, Validators.min(0.01)]]
    }));
  }

  removerUsoInsumo(index: number): void {
    this.usosInsumos.removeAt(index);
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.toastService.mostrarAdvertencia('Revisa los campos del formulario');
      return;
    }

    this.guardando = true;
    
    const payload = { ...this.formulario.value };
    if (payload.fechaProgramada) {
      payload.fechaProgramada = payload.fechaProgramada + ':00';
    }
    
    payload.areaComunId = Number(payload.areaComunId);
    payload.usosInsumos = payload.usosInsumos.map((uso: { insumoId: string | number, cantidadUsada: number }) => ({
      insumoId: Number(uso.insumoId),
      cantidadUsada: uso.cantidadUsada
    }));

    this.mantenimientoService.registrarTarea(payload).subscribe({
      next: () => {
        this.toastService.mostrarExito('Tarea e insumos registrados correctamente');
        this.router.navigate(['/mantenimiento']);
      },
      error: () => {
        this.toastService.mostrarError('Error al registrar la tarea');
        this.guardando = false;
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/mantenimiento']);
  }
}
