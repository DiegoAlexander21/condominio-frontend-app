import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncidenciaResponse } from '../../modelos/incidencia-response';
import { IncidenciasService } from '../../services/incidencias.service';

@Component({
  selector: 'app-modal-detalle-incidencia',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-detalle-incidencia.html',
  styleUrls: ['./modal-detalle-incidencia.scss']
})
export class ModalDetalleIncidenciaComponent implements OnInit {
  @Input() incidencia!: IncidenciaResponse;
  @Output() cerrar = new EventEmitter<void>();

  private incidenciasService = inject(IncidenciasService);

  evidenciasSeleccionadas: string[] = [];
  cargandoEvidencias = true;

  ngOnInit(): void {
    if (this.incidencia && this.incidencia.id) {
      this.incidenciasService.obtenerEvidencias(this.incidencia.id).subscribe({
        next: (evs: string[]) => {
          this.evidenciasSeleccionadas = evs;
          this.cargandoEvidencias = false;
        },
        error: () => {
          this.evidenciasSeleccionadas = [];
          this.cargandoEvidencias = false;
        }
      });
    }
  }

  cerrarModalFondo(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.cerrar.emit();
    }
  }

  abrirImagen(url: string): void {
    window.open(url, '_blank');
  }
}
