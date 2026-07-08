import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MantenimientoService } from '../../services/mantenimiento.service';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';
import { MensajeErrorComponent } from '../../../../compartido/componentes/mensaje-error/mensaje-error';

@Component({
  selector: 'app-formulario-insumo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MensajeErrorComponent],
  templateUrl: './formulario-insumo.html',
  styleUrls: ['./formulario-insumo.scss']
})
export class FormularioInsumoComponent {
  private fb = inject(FormBuilder);
  private mantenimientoService = inject(MantenimientoService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  formulario: FormGroup;
  guardando = false;

  constructor() {
    this.formulario = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(150)]],
      unidadMedida: ['', [Validators.required, Validators.maxLength(30)]],
      stockActual: [0, [Validators.required, Validators.min(0)]],
      stockMinimo: [0, [Validators.required, Validators.min(0)]],
      precioUnitario: [0, [Validators.required, Validators.min(0)]]
    });
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.toastService.mostrarAdvertencia('Revisa los campos del formulario');
      return;
    }

    this.guardando = true;
    this.mantenimientoService.registrarInsumo(this.formulario.value).subscribe({
      next: () => {
        this.toastService.mostrarExito('Insumo registrado correctamente');
        this.router.navigate(['/mantenimiento']);
      },
      error: () => {
        this.toastService.mostrarError('Error al registrar el insumo');
        this.guardando = false;
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/mantenimiento']);
  }
}
