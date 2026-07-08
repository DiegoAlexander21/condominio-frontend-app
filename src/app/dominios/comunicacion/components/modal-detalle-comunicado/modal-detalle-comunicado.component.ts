import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComunicadoResponse } from '../../modelos/comunicado.model';
import { ListaComunicadosState } from '../lista-comunicados/lista-comunicados.helper';

@Component({
  selector: 'app-modal-detalle-comunicado',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-detalle-comunicado.component.html',
  styleUrls: ['./modal-detalle-comunicado.component.scss'],
  providers: [ListaComunicadosState]
})
export class ModalDetalleComunicadoComponent {
  @Input() comunicado!: ComunicadoResponse;
  @Output() cerrar = new EventEmitter<void>();

  constructor(public state: ListaComunicadosState) {}

  cerrarModalFondo(event: MouseEvent): void {
    if ((event.target as HTMLElement).className === 'modal-overlay') {
      this.cerrar.emit();
    }
  }
}
