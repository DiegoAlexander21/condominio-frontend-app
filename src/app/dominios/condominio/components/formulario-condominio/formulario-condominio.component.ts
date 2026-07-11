import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MensajeErrorComponent } from '../../../../compartido/componentes/mensaje-error/mensaje-error';
import { CondominioService } from '../../services/condominio.service';
import { CondominioForm } from '../../modelos/condominio-form.interface';

import { ToastService } from '../../../../compartido/componentes/toast/toast.service';

@Component({
  selector: 'app-formulario-condominio',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MensajeErrorComponent],
  templateUrl: './formulario-condominio.component.html',
  styleUrls: ['./formulario-condominio.component.scss']
})
export class FormularioCondominioComponent implements OnInit {
  private constructorFormulario = inject(FormBuilder);
  private condominioServicio = inject(CondominioService);
  private toastServicio = inject(ToastService);
  private enrutador = inject(Router);
  private rutaActiva = inject(ActivatedRoute);

  esEdicion = false;
  condominioId: number | null = null;
  nombreOriginal: string = '';
  private estadoInicial: Partial<CondominioForm> | null = null;

  formularioCondominio: FormGroup = this.constructorFormulario.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    torres: [1, [Validators.required, Validators.min(1), Validators.pattern('^[0-9]+$')]],
    pisosPorTorre: [1, [Validators.required, Validators.min(1), Validators.pattern('^[0-9]+$')]]
  });

  ngOnInit(): void {
    const idParam = this.rutaActiva.snapshot.paramMap.get('id');
    if (idParam) {
      this.esEdicion = true;
      this.condominioId = Number(idParam);
      this.cargarDatosCondominio(this.condominioId);
    } else {
      this.estadoInicial = this.formularioCondominio.value;
    }
  }

  cargarDatosCondominio(id: number): void {
    this.condominioServicio.obtenerCondominio(id).subscribe({
      next: (condominio) => {
        this.nombreOriginal = condominio.nombre;
        this.formularioCondominio.patchValue({
          nombre: condominio.nombre,
          torres: condominio.torres,
          pisosPorTorre: condominio.pisosPorTorre
        });
        this.estadoInicial = this.formularioCondominio.value;
      },
      error: (err: unknown) => {
        this.toastServicio.mostrarError('Error al cargar datos del condominio.');
        console.error(err);
      }
    });
  }

  get formularioHaCambiado(): boolean {
    if (!this.estadoInicial) return true;
    return JSON.stringify(this.formularioCondominio.value) !== JSON.stringify(this.estadoInicial);
  }

  guardarDatos(): void {
    if (this.formularioCondominio.valid) {
      const operacion = this.esEdicion && this.condominioId
        ? this.condominioServicio.actualizarCondominio(this.condominioId, this.formularioCondominio.value)
        : this.condominioServicio.crearCondominio(this.formularioCondominio.value);

      operacion.subscribe({
        next: () => {
          const mensaje = this.esEdicion ? 'Condominio actualizado exitosamente' : 'Condominio registrado exitosamente';
          this.toastServicio.mostrarExito(mensaje);
          this.enrutador.navigate(['/condominios']);
        },
        error: (error: unknown) => {
          const e = error as { error?: { error?: string } };
          this.toastServicio.mostrarError(e?.error?.error || 'Error al guardar el condominio');
          console.error(error);
        }
      });
    } else {
      this.formularioCondominio.markAllAsTouched();
    }
  }

  cancelar(): void {
    this.enrutador.navigate(['/condominios']);
  }
}
