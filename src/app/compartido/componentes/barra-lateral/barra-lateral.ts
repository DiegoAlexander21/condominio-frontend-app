import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideBuilding2 } from '@lucide/angular';

@Component({
  selector: 'app-barra-lateral',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideBuilding2],
  templateUrl: './barra-lateral.html',
  styleUrls: ['./barra-lateral.scss']
})
export class BarraLateralComponent {
  @Input() menuAbierto: boolean = false;
  @Output() alCerrar = new EventEmitter<void>();

  cerrarMenuMovil(): void {
    this.alCerrar.emit();
  }
}
