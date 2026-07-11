import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CalificacionService } from '../../services/calificacion.service';
import { MensajeErrorComponent } from '../../../../compartido/componentes/mensaje-error/mensaje-error';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';
import { AreasComunesService } from '../../../areascomunes/services/areas-comunes';
import { UnidadService } from '../../../unidades/services/unidad';
import { AutenticacionService } from '../../../../nucleo/servicios/autenticacion.service';

@Component({
  selector: 'app-calificar-area',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MensajeErrorComponent],
  templateUrl: './calificar-area.html',
  styleUrls: ['./calificar-area.scss']
})
export class CalificarAreaComponent implements OnInit {
  formulario: FormGroup;
  areaId: number = 0;
  areaNombre: string = '';
  unidadNombreMostrar: string = 'Cargando unidad...';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private calificacionService: CalificacionService,
    private areaComunService: AreasComunesService,
    private unidadService: UnidadService,
    private toastService: ToastService,
    private authService: AutenticacionService
  ) {
    this.formulario = this.fb.group({
      areaComunId: ['', Validators.required],
      unidadId: [this.authService.obtenerUnidadId(), Validators.required],
      puntaje: ['', [Validators.required, Validators.min(1), Validators.max(5)]],
      comentario: ['', [Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.areaId = +id;
      this.formulario.patchValue({ areaComunId: this.areaId });
      this.cargarDatosArea();
    }

    const unidadId = this.authService.obtenerUnidadId();
    if (unidadId) {
      this.unidadService.obtenerUnidad(unidadId).subscribe({
        next: (u) => {
          this.unidadNombreMostrar = `${u.numeroUnidad} (Torre ${u.torre})`;
        },
        error: () => {
          this.unidadNombreMostrar = 'Unidad vinculada a su cuenta';
        }
      });
    } else {
      this.unidadNombreMostrar = 'Unidad no vinculada';
    }
  }

  cargarDatosArea(): void {
    this.areaComunService.obtenerArea(this.areaId).subscribe({
      next: (area) => {
        this.areaNombre = area.nombre;
      },
      error: () => this.toastService.mostrarError('No se pudo cargar el área.')
    });
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.toastService.mostrarAdvertencia('Por favor complete los campos correctamente.');
      return;
    }

    this.calificacionService.registrarCalificacion(this.formulario.value).subscribe({
      next: (res) => {
        this.toastService.mostrarExito(res.mensaje);
        this.calificacionService.actualizarEstadoManual(this.areaId).subscribe({
          next: () => this.volver(),
          error: () => this.volver()
        });
      },
      error: (err: unknown) => {
        const error = err as { error?: { error?: string } };
        this.toastService.mostrarError(error.error?.error || 'Error al registrar calificación');
      }
    });
  }

  volver(): void {
    this.router.navigate(['/calificaciones']);
  }
}
