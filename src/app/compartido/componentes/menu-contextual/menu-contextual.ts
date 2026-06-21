import { Component, EventEmitter, Input, Output, HostListener, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-menu-contextual',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu-contextual.html',
  styleUrls: ['./menu-contextual.scss']
})
export class MenuContextualComponent {
  @Input() identificador!: number;
  @Input() mostrarAsignarOcupantes: boolean = false;
  @Input() mostrarVerDetalle: boolean = false;
  @Output() alEditar = new EventEmitter<number>();
  @Output() alEliminar = new EventEmitter<number>();
  @Output() alAsignarOcupantes = new EventEmitter<number>();
  @Output() alVerDetalle = new EventEmitter<number>();

  menuAbierto = false;
  private referenciaElemento = inject(ElementRef);

  alternarMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }

  editar(): void {
    this.alEditar.emit(this.identificador);
    this.menuAbierto = false;
  }

  eliminar(): void {
    this.alEliminar.emit(this.identificador);
    this.menuAbierto = false;
  }

  asignarOcupantes(): void {
    this.alAsignarOcupantes.emit(this.identificador);
    this.menuAbierto = false;
  }

  verDetalle(): void {
    this.alVerDetalle.emit(this.identificador);
    this.menuAbierto = false;
  }

  @HostListener('document:click', ['$event'])
  cerrarMenuAlHacerClicFuera(evento: Event): void {
    if (!this.referenciaElemento.nativeElement.contains(evento.target)) {
      this.menuAbierto = false;
    }
  }
}
