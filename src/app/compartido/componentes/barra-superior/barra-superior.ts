import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-barra-superior',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './barra-superior.html',
  styleUrls: ['./barra-superior.scss']
})
export class BarraSuperiorComponent {
  @Output() alAlternarMenu = new EventEmitter<void>();
  @Output() alSalir = new EventEmitter<void>();

  alternarMenu(): void {
    this.alAlternarMenu.emit();
  }

  salir(): void {
    this.alSalir.emit();
  }
}
