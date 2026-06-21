import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-mensaje-error',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mensaje-error.html',
  styleUrls: ['./mensaje-error.scss']
})
export class MensajeErrorComponent {
  @Input() control: AbstractControl | null = null;
  @Input() nombreCampo: string = 'Este campo';
  @Input() mensajesPersonalizados?: Record<string, string>;

  debeMostrarError(): boolean {
    return !!(this.control && this.control.invalid && this.control.touched);
  }

  obtenerMensajeError(): string {
    if (!this.control || !this.control.errors) return '';

    if (this.mensajesPersonalizados) {
      const primerError = Object.keys(this.control.errors)[0];
      if (this.mensajesPersonalizados[primerError]) {
        return this.mensajesPersonalizados[primerError];
      }
    }

    if (this.control.errors['required']) {
      return `${this.nombreCampo} es requerido.`;
    }
    if (this.control.errors['email']) {
      return `Debe ser un correo válido.`;
    }
    if (this.control.errors['minlength']) {
      return `Debe tener al menos ${this.control.errors['minlength'].requiredLength} caracteres.`;
    }
    if (this.control.errors['min']) {
      return `El valor mínimo es ${this.control.errors['min'].min}.`;
    }
    
    return 'Valor inválido.';
  }
}
