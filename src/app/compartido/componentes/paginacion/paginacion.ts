import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-paginacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './paginacion.html',
  styleUrls: ['./paginacion.scss']
})
export class PaginacionComponent {
  @Input() paginaActual: number = 0;
  @Input() totalPaginas: number = 0;
  @Output() cambioPagina = new EventEmitter<number>();

  irAnterior(): void {
    if (this.paginaActual > 0) {
      this.cambioPagina.emit(this.paginaActual - 1);
    }
  }

  irSiguiente(): void {
    if (this.paginaActual < this.totalPaginas - 1) {
      this.cambioPagina.emit(this.paginaActual + 1);
    }
  }
}
