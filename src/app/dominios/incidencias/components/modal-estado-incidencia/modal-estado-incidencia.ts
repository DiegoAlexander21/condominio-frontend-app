import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IncidenciaResponse, EstadoIncidencia } from '../../modelos/incidencia-response';
import { IncidenciasService } from '../../services/incidencias.service';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-modal-estado-incidencia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-estado-incidencia.html',
  styleUrls: ['./modal-estado-incidencia.scss']
})
export class ModalEstadoIncidenciaComponent implements OnInit {
  @Input() incidencia!: IncidenciaResponse;
  @Output() cerrar = new EventEmitter<void>();
  @Output() estadoActualizado = new EventEmitter<void>();

  private incidenciasService = inject(IncidenciasService);
  private toastService = inject(ToastService);

  estados = Object.values(EstadoIncidencia);
  responsableModal = '';
  esDanioProvocado = false;

  ngOnInit(): void {
    if (this.incidencia) {
      this.esDanioProvocado = this.incidencia.causa === 'MAL_USO' || this.incidencia.causa === 'VANDALISMO';
      const responsable = this.incidencia.responsableAtencion;
      this.responsableModal = (responsable && responsable !== 'Sin asignar') ? responsable : '';
    }
  }

  cerrarModalFondo(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.cerrar.emit();
    }
  }

  confirmarCambioEstado(nuevoEstado: string): void {
    this.incidenciasService.actualizarEstado(this.incidencia.id, { 
      incidenciaId: this.incidencia.id,
      estado: nuevoEstado,
      responsableAtencion: this.responsableModal
    }).subscribe({
      next: () => {
        this.toastService.mostrarExito('Estado actualizado correctamente');
        this.estadoActualizado.emit();
      },
      error: (err: HttpErrorResponse) => {
        this.toastService.mostrarError('Error al actualizar estado');
      }
    });
  }

  formatearEstado(estado: string): string {
    const nombresEstados: Record<string, string> = {
      'REGISTRADO': 'Registrado',
      'EN_REVISION': 'En Revisión',
      'EN_ATENCION': 'En Atención',
      'RESUELTO': 'Resuelto'
    };
    return nombresEstados[estado] || estado;
  }
}
