import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UnidadService } from '../../services/unidad';
import { UnidadResponse } from '../../modelos/unidad-response.interface';
import { RespuestaPaginada } from '../../../../compartido/modelos/respuesta-paginada.interface';
import { MenuContextualComponent } from '../../../../compartido/componentes/menu-contextual/menu-contextual';
import { PaginacionComponent } from '../../../../compartido/componentes/paginacion/paginacion';
import { ModalConfirmacionComponent } from '../../../../compartido/componentes/modal-confirmacion/modal-confirmacion';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-lista-unidades',
  standalone: true,
  imports: [CommonModule, RouterModule, MenuContextualComponent, PaginacionComponent, ModalConfirmacionComponent],
  templateUrl: './lista-unidades.html',
  styleUrls: ['./lista-unidades.scss']
})
export class ListaUnidadesComponent implements OnInit {
  private unidadServicio = inject(UnidadService);
  private enrutador = inject(Router);
  private toastServicio = inject(ToastService);
  
  respuestaPaginada$: Observable<RespuestaPaginada<UnidadResponse>> | undefined;
  paginaActual = 0;
  tamanoPagina = 9;

  mostrarModalEliminar = false;
  idUnidadAEliminar: number | null = null;

  ngOnInit(): void {
    this.obtenerDatos();
  }

  obtenerDatos(): void {
    this.respuestaPaginada$ = this.unidadServicio.obtenerListaUnidades(this.paginaActual, this.tamanoPagina);
  }

  cambiarPagina(nuevaPagina: number): void {
    this.paginaActual = nuevaPagina;
    this.obtenerDatos();
  }

  editarUnidad(id: number): void {
    this.enrutador.navigate(['/unidades/editar', id]);
  }

  asignarOcupantes(id: number): void {
    this.enrutador.navigate(['/unidades/asignar-ocupantes', id]);
  }

  eliminarUnidad(id: number): void {
    this.idUnidadAEliminar = id;
    this.mostrarModalEliminar = true;
  }

  cancelarEliminacion(): void {
    this.mostrarModalEliminar = false;
    this.idUnidadAEliminar = null;
  }

  confirmarEliminacion(): void {
    if (this.idUnidadAEliminar !== null) {
      this.unidadServicio.eliminarUnidad(this.idUnidadAEliminar).subscribe({
        next: () => {
          this.toastServicio.mostrarExito('Unidad eliminada exitosamente.');
          this.mostrarModalEliminar = false;
          this.idUnidadAEliminar = null;
          this.obtenerDatos();
        },
        error: (error) => {
          this.toastServicio.mostrarError('Error al eliminar la unidad.');
          this.mostrarModalEliminar = false;
          this.idUnidadAEliminar = null;
        }
      });
    }
  }
}
