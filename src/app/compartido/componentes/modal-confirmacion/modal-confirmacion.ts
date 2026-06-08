import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-confirmacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-confirmacion.html',
  styleUrls: ['./modal-confirmacion.scss']
})
export class ModalConfirmacionComponent {
  @Input() visible: boolean = false;
  @Output() alCancelar = new EventEmitter<void>();
  @Output() alConfirmar = new EventEmitter<void>();

  cancelar(): void {
    this.alCancelar.emit();
  }

  confirmar(): void {
    this.alConfirmar.emit();
  }
}
