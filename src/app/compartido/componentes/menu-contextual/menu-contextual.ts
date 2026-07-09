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
  @Input() mostrarEditar: boolean = true;
  @Input() mostrarActualizarEstado: boolean = false;
  @Input() mostrarDistribuir: boolean = false;
  @Input() mostrarRegistrarPago: boolean = false;
  @Input() mostrarAprobar: boolean = false;
  @Input() mostrarRechazar: boolean = false;
  @Input() mostrarEliminar: boolean = true;
  @Input() mostrarEvaluar: boolean = false;
  @Input() mostrarCalificar: boolean = false;
  @Output() alEditar = new EventEmitter<number>();
  @Output() alEliminar = new EventEmitter<number>();
  @Output() alEvaluar = new EventEmitter<number>();
  @Output() alDistribuir = new EventEmitter<number>();
  @Output() alAsignarOcupantes = new EventEmitter<number>();
  @Output() alVerDetalle = new EventEmitter<number>();
  @Output() alActualizarEstado = new EventEmitter<number>();
  @Output() alRegistrarPago = new EventEmitter<number>();
  @Output() alAprobar = new EventEmitter<number>();
  @Output() alRechazar = new EventEmitter<number>();
  @Output() alCalificar = new EventEmitter<number>();

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

  evaluar(): void {
    this.alEvaluar.emit(this.identificador);
    this.menuAbierto = false;
  }

  distribuir(): void {
    this.alDistribuir.emit(this.identificador);
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

  actualizarEstado(): void {
    this.alActualizarEstado.emit(this.identificador);
    this.menuAbierto = false;
  }

  registrarPago(): void {
    this.alRegistrarPago.emit(this.identificador);
    this.menuAbierto = false;
  }

  aprobar(): void {
    this.alAprobar.emit(this.identificador);
    this.menuAbierto = false;
  }

  rechazar(): void {
    this.alRechazar.emit(this.identificador);
    this.menuAbierto = false;
  }

  calificar(): void {
    this.alCalificar.emit(this.identificador);
    this.menuAbierto = false;
  }

  @HostListener('document:click', ['$event'])
  cerrarMenuAlHacerClicFuera(evento: Event): void {
    if (!this.referenciaElemento.nativeElement.contains(evento.target)) {
      this.menuAbierto = false;
    }
  }
}
