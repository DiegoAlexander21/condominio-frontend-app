import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { AreasComunesService } from '../../services/areas-comunes';
import { CondominioService } from '../../../condominio/services/condominio.service';
import { AreaComunResponse } from '../../modelos/area-comun-response';
import { CondominioResponse } from '../../../condominio/modelos/condominio-response.interface';
import { MenuContextualComponent } from '../../../../compartido/componentes/menu-contextual/menu-contextual';
import { PaginacionComponent } from '../../../../compartido/componentes/paginacion/paginacion';
import { ModalConfirmacionComponent } from '../../../../compartido/componentes/modal-confirmacion/modal-confirmacion';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';
import { SelectPersonalizadoComponent } from '../../../../compartido/componentes/select-personalizado/select-personalizado';


@Component({
  selector: 'app-lista-areas',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, MenuContextualComponent, PaginacionComponent, ModalConfirmacionComponent, SelectPersonalizadoComponent],
  templateUrl: './lista-areas.html',
  styleUrls: ['./lista-areas.scss']
})
export class ListaAreasComponent implements OnInit {
  private areasComunesServicio = inject(AreasComunesService);
  private condominioServicio = inject(CondominioService);
  private formBuilder = inject(FormBuilder);
  private enrutador = inject(Router);
  private toastServicio = inject(ToastService);

  listaAreas: AreaComunResponse[] = [];
  listaCondominios: CondominioResponse[] = [];
  formularioFiltro: FormGroup;
  cargando = true;
  
  paginaActual = 0;
  tamanoPagina = 9;
  totalElementos = 0;
  totalPaginas = 0;
  ultimaPagina = false;

  areaSeleccionada: AreaComunResponse | null = null;
  mostrarModalDetalle = false;
  mostrarModalEliminar = false;
  idAreaAEliminar: number | null = null;
  constructor() {
    this.formularioFiltro = this.formBuilder.group({
      condominioId: ['']
    });
  }

  ngOnInit(): void {
    this.cargarCondominios();
    
    this.formularioFiltro.get('condominioId')?.valueChanges.subscribe((valor: string | null) => {
      this.paginaActual = 0;
      this.cargarAreas(valor ? Number(valor) : undefined);
    });
  }

  cargarCondominios(): void {
    this.condominioServicio.obtenerListaCondominios(0, 100).pipe(
      catchError((error: unknown) => {
        console.error(error);
        return of({ contenido: [], paginaActual: 0, totalElementos: 0, totalPaginas: 0, ultimaPagina: true });
      })
    ).subscribe(respuesta => {
      this.listaCondominios = respuesta.contenido;
      this.cargarAreas();
    });
  }

  cargarAreas(condominioId?: number): void {
    this.cargando = true;
    const condId = condominioId || (this.formularioFiltro.get('condominioId')?.value ? Number(this.formularioFiltro.get('condominioId')?.value) : undefined);
    
    this.areasComunesServicio.obtenerAreas(condId, this.paginaActual, this.tamanoPagina).pipe(
      catchError((error: unknown) => {
        console.error(error);
        return of({ contenido: [], paginaActual: 0, totalElementos: 0, totalPaginas: 0, ultimaPagina: true });
      })
    ).subscribe(respuesta => {
      this.listaAreas = respuesta.contenido;
      this.paginaActual = respuesta.paginaActual;
      this.totalElementos = respuesta.totalElementos;
      this.totalPaginas = respuesta.totalPaginas;
      this.ultimaPagina = respuesta.ultimaPagina || false;
      this.cargando = false;
    });
  }

  cambiarPagina(nuevaPagina: number): void {
    this.paginaActual = nuevaPagina;
    this.cargarAreas();
  }

  eliminarArea(id: number): void {
    this.idAreaAEliminar = id;
    this.mostrarModalEliminar = true;
  }

  cancelarEliminacion(): void {
    this.mostrarModalEliminar = false;
    this.idAreaAEliminar = null;
  }

  confirmarEliminacion(): void {
    if (this.idAreaAEliminar !== null) {
      this.areasComunesServicio.eliminarArea(this.idAreaAEliminar).subscribe({
        next: () => {
          this.toastServicio.mostrarExito('Área común eliminada exitosamente.');
          this.mostrarModalEliminar = false;
          this.idAreaAEliminar = null;
          const condominioId = this.formularioFiltro.get('condominioId')?.value;
          this.cargarAreas(condominioId ? Number(condominioId) : undefined);
        },
        error: () => {
          this.toastServicio.mostrarError('Error al eliminar el área común.');
          this.mostrarModalEliminar = false;
          this.idAreaAEliminar = null;
        }
      });
    }
  }

  editarArea(id: number): void {
    this.enrutador.navigate(['/areas-comunes/editar', id]);
  }

  verDetallesArea(id: number): void {
    const area = this.listaAreas.find(a => a.id === id);
    if (area) {
      this.areaSeleccionada = area;
      this.mostrarModalDetalle = true;
    }
  }

  cerrarModal(): void {
    this.mostrarModalDetalle = false;
    this.areaSeleccionada = null;
  }

  cerrarModalFondo(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.cerrarModal();
    }
  }
}
