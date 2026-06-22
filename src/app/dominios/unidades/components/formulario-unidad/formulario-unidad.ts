import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { UnidadService } from '../../services/unidad';
import { CondominioService } from '../../../../dominios/condominio/services/condominio.service';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';
import { CondominioResponse } from '../../../../dominios/condominio/modelos/condominio-response.interface';
import { MensajeErrorComponent } from '../../../../compartido/componentes/mensaje-error/mensaje-error';

@Component({
  selector: 'app-formulario-unidad',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MensajeErrorComponent],
  templateUrl: './formulario-unidad.html',
  styleUrls: ['./formulario-unidad.scss']
})
export class FormularioUnidadComponent implements OnInit {
  private constructorFormulario = inject(FormBuilder);
  private unidadServicio = inject(UnidadService);
  private condominioServicio = inject(CondominioService);
  private enrutador = inject(Router);
  private rutaActiva = inject(ActivatedRoute);
  private toastServicio = inject(ToastService);

  formularioUnidad: FormGroup;
  esEdicion = false;
  idUnidad: number | null = null;
  condominios: CondominioResponse[] = [];
  condominioSeleccionado: CondominioResponse | null = null;
  estadoInicial: any;
  nombreOriginal = '';

  constructor() {
    this.formularioUnidad = this.constructorFormulario.group({
      nombreCondominio: ['', [Validators.required]],
      torre: ['', [Validators.required, Validators.maxLength(10)]],
      numeroUnidad: ['', [Validators.required, Validators.maxLength(20)]],
      piso: ['', [Validators.required, Validators.min(1), Validators.pattern('^[0-9]+$')]],
      area: ['', [Validators.required, Validators.min(1.0), Validators.pattern('^\\d+(\\.\\d{1,2})?$')]]
    });
  }

  ngOnInit(): void {
    this.cargarCondominios();
    
    const idParametro = this.rutaActiva.snapshot.paramMap.get('id');
    if (idParametro) {
      this.esEdicion = true;
      this.idUnidad = Number(idParametro);
      this.cargarUnidad();
    } else {
      this.estadoInicial = this.formularioUnidad.getRawValue();
    }

    this.formularioUnidad.get('nombreCondominio')?.valueChanges.subscribe(nombre => {
      this.condominioSeleccionado = this.condominios.find(c => c.nombre === nombre) || null;
    });
  }

  private cargarCondominios(): void {
    this.condominioServicio.obtenerListaCondominios(0, 1000).subscribe({
      next: (respuesta) => {
        this.condominios = respuesta.contenido;
        const nombreActual = this.formularioUnidad.get('nombreCondominio')?.value;
        if (nombreActual) {
          this.condominioSeleccionado = this.condominios.find(c => c.nombre === nombreActual) || null;
        }
      },
      error: () => this.toastServicio.mostrarError('Error al cargar la lista de condominios.')
    });
  }

  private cargarUnidad(): void {
    if (this.idUnidad) {
      this.unidadServicio.obtenerUnidad(this.idUnidad).subscribe({
        next: (unidad) => {
          this.formularioUnidad.patchValue({
            nombreCondominio: unidad.nombreCondominio,
            torre: unidad.torre,
            numeroUnidad: unidad.numeroUnidad,
            piso: unidad.piso,
            area: unidad.area
          });
          this.estadoInicial = this.formularioUnidad.getRawValue();
          this.nombreOriginal = `${unidad.torre} - Dpto ${unidad.numeroUnidad}`;
          this.condominioSeleccionado = this.condominios.find(c => c.nombre === unidad.nombreCondominio) || null;
        },
        error: () => {
          this.toastServicio.mostrarError('Error al cargar los datos de la unidad.');
          this.volver();
        }
      });
    }
  }

  guardar(): void {
    if (this.formularioUnidad.invalid) {
      this.formularioUnidad.markAllAsTouched();
      return;
    }

    const datosUnidad = this.formularioUnidad.value;

    if (this.esEdicion && this.idUnidad) {
      this.unidadServicio.actualizarUnidad(this.idUnidad, datosUnidad).subscribe({
        next: () => {
          this.toastServicio.mostrarExito('Unidad actualizada exitosamente.');
          this.volver();
        },
        error: (error) => {
          const mensaje = error.error?.error || 'Error al actualizar la unidad.';
          this.toastServicio.mostrarError(mensaje);
        }
      });
    } else {
      this.unidadServicio.crearUnidad(datosUnidad).subscribe({
        next: () => {
          this.toastServicio.mostrarExito('Unidad creada exitosamente.');
          this.volver();
        },
        error: (error) => {
          const mensaje = error.error?.error || 'Error al crear la unidad.';
          this.toastServicio.mostrarError(mensaje);
        }
      });
    }
  }

  formularioHaCambiado(): boolean {
    if (!this.estadoInicial) return true;
    return JSON.stringify(this.estadoInicial) !== JSON.stringify(this.formularioUnidad.getRawValue());
  }

  volver(): void {
    this.enrutador.navigate(['/unidades']);
  }
}
