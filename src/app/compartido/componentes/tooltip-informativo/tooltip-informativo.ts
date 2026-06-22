import { Component, HostListener, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tooltip-informativo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tooltip-informativo.html',
  styleUrls: ['./tooltip-informativo.scss']
})
export class TooltipInformativoComponent {
  @Input() icono: string = 'info';
  @Input() titulo: string = 'Información';
  
  mostrarTooltip: boolean = false;

  alternarTooltip(evento: Event): void {
    evento.stopPropagation();
    this.mostrarTooltip = !this.mostrarTooltip;
  }

  mostrar(): void {
    this.mostrarTooltip = true;
  }

  ocultar(): void {
    this.mostrarTooltip = false;
  }

  @HostListener('document:click')
  cerrarAlHacerClicAfuera(): void {
    if (this.mostrarTooltip) {
      this.mostrarTooltip = false;
    }
  }
}
