import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CondominioService } from '../../services/condominio.service';
import { CondominioResponse } from '../../modelos/condominio-response.interface';
import { RespuestaPaginada } from '../../../../compartido/modelos/respuesta-paginada.interface';
import { MenuContextualComponent } from '../../../../compartido/componentes/menu-contextual/menu-contextual';
import { PaginacionComponent } from '../../../../compartido/componentes/paginacion/paginacion';
import { ModalConfirmacionComponent } from '../../../../compartido/componentes/modal-confirmacion/modal-confirmacion';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-lista-condominios',
  standalone: true,
  imports: [CommonModule, RouterModule, MenuContextualComponent, PaginacionComponent, ModalConfirmacionComponent],
  templateUrl: './lista-condominios.component.html',
  styleUrls: ['./lista-condominios.component.scss']
})
export class ListaCondominiosComponent implements OnInit {
  private condominioServicio = inject(CondominioService);
  private enrutador = inject(Router);
  private toastServicio = inject(ToastService);
  
  respuestaPaginada$: Observable<RespuestaPaginada<CondominioResponse>> | undefined;
  paginaActual = 0;
  tamanoPagina = 9;

  mostrarModalEliminar = false;
  idCondominioAEliminar: number | null = null;

  ngOnInit(): void {
    this.obtenerDatos();
  }

  obtenerDatos(): void {
    this.respuestaPaginada$ = this.condominioServicio.obtenerListaCondominios(this.paginaActual, this.tamanoPagina);
  }

  cambiarPagina(nuevaPagina: number): void {
    this.paginaActual = nuevaPagina;
    this.obtenerDatos();
  }

  editarCondominio(id: number): void {
    this.enrutador.navigate(['/condominios/editar', id]);
  }

  eliminarCondominio(id: number): void {
    this.idCondominioAEliminar = id;
    this.mostrarModalEliminar = true;
  }

  cancelarEliminacion(): void {
    this.mostrarModalEliminar = false;
    this.idCondominioAEliminar = null;
  }

  confirmarEliminacion(): void {
    if (this.idCondominioAEliminar !== null) {
      this.condominioServicio.eliminarCondominio(this.idCondominioAEliminar).subscribe({
        next: () => {
          this.toastServicio.mostrarExito('Condominio eliminado exitosamente.');
          this.mostrarModalEliminar = false;
          this.idCondominioAEliminar = null;
          this.obtenerDatos();
        },
        error: (error) => {
          this.toastServicio.mostrarError('Error al eliminar el condominio.');
          this.mostrarModalEliminar = false;
          this.idCondominioAEliminar = null;
        }
      });
    }
  }
}
