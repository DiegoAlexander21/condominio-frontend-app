import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MantenimientoService } from '../../services/mantenimiento.service';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';
import { TareaMantenimientoResponse } from '../../modelos/tarea-mantenimiento.model';
import { PaginacionComponent } from '../../../../compartido/componentes/paginacion/paginacion';
import { ModalConfirmacionComponent } from '../../../../compartido/componentes/modal-confirmacion/modal-confirmacion';
import { MenuContextualComponent } from '../../../../compartido/componentes/menu-contextual/menu-contextual';

@Component({
  selector: 'app-lista-tareas',
  standalone: true,
  imports: [CommonModule, RouterModule, PaginacionComponent, ModalConfirmacionComponent, MenuContextualComponent],
  templateUrl: './lista-tareas.html',
  styleUrls: ['./lista-tareas.scss']
})
export class ListaTareasComponent implements OnInit {
  private mantenimientoService = inject(MantenimientoService);
  private toastService = inject(ToastService);

  todasLasTareas: TareaMantenimientoResponse[] = [];
  tareasPaginadas: TareaMantenimientoResponse[] = [];
  
  cargando = true;
  paginaActual = 1;
  tamanoPagina = 9;
  totalPaginas = 1;

  tareaSeleccionada: TareaMantenimientoResponse | null = null;
  mostrarModalInsumos = false;

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    this.cargando = true;
    this.mantenimientoService.listarTareas(0, 10000).subscribe({
      next: (res) => {
        this.todasLasTareas = res.contenido;
        this.totalPaginas = Math.ceil(this.todasLasTareas.length / this.tamanoPagina);
        this.actualizarPaginacion();
        this.cargando = false;
      },
      error: () => {
        this.toastService.mostrarError('Error al cargar historial de tareas');
        this.cargando = false;
      }
    });
  }

  actualizarPaginacion(): void {
    const inicio = (this.paginaActual - 1) * this.tamanoPagina;
    const fin = inicio + this.tamanoPagina;
    this.tareasPaginadas = this.todasLasTareas.slice(inicio, fin);
  }

  cambiarPagina(pagina: number): void {
    this.paginaActual = pagina;
    this.actualizarPaginacion();
  }

  verInsumos(tareaId: number): void {
    this.tareaSeleccionada = this.todasLasTareas.find(t => t.id === tareaId) || null;
    if (this.tareaSeleccionada) {
      this.mostrarModalInsumos = true;
    }
  }

  cerrarModalInsumos(): void {
    this.mostrarModalInsumos = false;
    this.tareaSeleccionada = null;
  }
}
