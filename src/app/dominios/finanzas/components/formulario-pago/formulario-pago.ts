import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FinanzasService } from '../../services/finanzas.service';
import { CloudinaryService } from '../../../../compartido/servicios/cloudinary.service';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';
import { MensajeErrorComponent } from '../../../../compartido/componentes/mensaje-error/mensaje-error';

@Component({
  selector: 'app-formulario-pago',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MensajeErrorComponent],
  templateUrl: './formulario-pago.html',
  styleUrls: ['./formulario-pago.scss']
})
export class FormularioPagoComponent implements OnInit {
  @Input() estadoCuentaId!: number;
  @Input() unidadId!: number;
  @Input() saldoPendiente!: number;
  @Output() pagoRegistrado = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private finanzasService = inject(FinanzasService);
  private cloudinaryService = inject(CloudinaryService);
  private toastService = inject(ToastService);

  formulario!: FormGroup;
  guardando = false;
  archivoSeleccionado: File | null = null;
  imagenPrevia: string | null = null;

  ngOnInit(): void {
    this.formulario = this.fb.group({
      monto: [this.saldoPendiente, [Validators.required, Validators.min(0.01), Validators.max(this.saldoPendiente)]],
      evidenciaUrl: [''],
      observacion: ['']
    });
  }

  alSeleccionarArchivo(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const archivo = input.files[0];
      
      if (archivo.size > 5 * 1024 * 1024) {
        this.toastService.mostrarError('La imagen excede el límite de 5 MB');
        return;
      }

      this.archivoSeleccionado = archivo;

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          this.imagenPrevia = e.target.result as string;
        }
      };
      reader.readAsDataURL(archivo);
    }
  }

  eliminarFoto(): void {
    this.archivoSeleccionado = null;
    this.imagenPrevia = null;
    this.formulario.patchValue({ evidenciaUrl: '' });
  }

  abrirImagen(): void {
    if (this.imagenPrevia) {
      window.open(this.imagenPrevia, '_blank');
    }
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    if (!this.archivoSeleccionado) {
      this.toastService.mostrarError('Debe adjuntar una evidencia fotográfica del pago');
      return;
    }

    this.guardando = true;

    this.cloudinaryService.subirImagen(this.archivoSeleccionado).subscribe({
      next: (res: { secure_url: string }) => {
        const evidenciaUrl = res.secure_url;
        this.formulario.patchValue({ evidenciaUrl });

        const formValue = {
          ...this.formulario.value,
          unidadId: this.unidadId,
          estadoCuentaId: this.estadoCuentaId
        };

        this.finanzasService.registrarPago(formValue).subscribe({
          next: () => {
            this.toastService.mostrarExito('Pago registrado como pendiente y enviado a revisión.');
            this.guardando = false;
            this.pagoRegistrado.emit();
          },
          error: (err) => {
            this.toastService.mostrarError(err.error?.error || 'Error al registrar el pago');
            this.guardando = false;
          }
        });
      },
      error: () => {
        this.toastService.mostrarError('Ocurrió un error al subir la evidencia de pago');
        this.guardando = false;
      }
    });
  }

  onCancelar(): void {
    this.cancelar.emit();
  }
}
