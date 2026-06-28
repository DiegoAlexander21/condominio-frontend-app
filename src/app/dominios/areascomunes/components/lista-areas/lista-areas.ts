import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { AreasComunesService } from '../../services/areas-comunes';
import { AreaComunResponse } from '../../modelos/area-comun-response';
import { MenuContextualComponent } from '../../../../compartido/componentes/menu-contextual/menu-contextual';
import { PaginacionComponent } from '../../../../compartido/componentes/paginacion/paginacion';
import { ModalConfirmacionComponent } from '../../../../compartido/componentes/modal-confirmacion/modal-confirmacion';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';
import { SelectPersonalizadoComponent } from '../../../../compartido/componentes/select-personalizado/select-personalizado';
import { InputBusquedaComponent } from '../../../../compartido/componentes/input-busqueda/input-busqueda';

@Component({
  selector: 'app-lista-areas',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    ReactiveFormsModule, 
    MenuContextualComponent, 
    PaginacionComponent, 
    ModalConfirmacionComponent, 
    SelectPersonalizadoComponent,
    InputBusquedaComponent
  ],
  templateUrl: './lista-areas.html',
  styleUrls: ['./lista-areas.scss']
})
export class ListaAreasComponent implements OnInit {
  private areasComunesServicio = inject(AreasComunesService);
  private formBuilder = inject(FormBuilder);
  private enrutador = inject(Router);
  private toastServicio = inject(ToastService);

  listaAreas: AreaComunResponse[] = [];
  listaAreasGlobal: AreaComunResponse[] = [];
  listaAreasFiltradas: AreaComunResponse[] = [];
  
  cargando = true;
  
  paginaActual = 0;
  tamanoPagina = 9;
  totalPaginas = 1;

  areaSeleccionada: AreaComunResponse | null = null;
  mostrarModalDetalle = false;
  mostrarModalEliminar = false;
  idAreaAEliminar: number | null = null;

  formularioFiltro: FormGroup;

  listaAforos = [
    { id: '1-10', nombre: 'Pequeño (Hasta 10)' },
    { id: '11-30', nombre: 'Mediano (11 a 30)' },
    { id: '31+', nombre: 'Grande (Más de 30)' }
  ];

  constructor() {
    this.formularioFiltro = this.formBuilder.group({
      termino: [''],
      aforo: ['']
    });
  }

  ngOnInit(): void {
    this.obtenerDatos();
  }

  obtenerDatos(): void {
    this.cargando = true;
    this.areasComunesServicio.obtenerAreas(undefined, 0, 10000).pipe(
      catchError((error: unknown) => {
        console.error(error);
        return of({ contenido: [], paginaActual: 0, totalElementos: 0, totalPaginas: 0, ultimaPagina: true });
      })
    ).subscribe(respuesta => {
      this.listaAreasGlobal = respuesta.contenido;
      this.cargando = false;
      this.aplicarFiltrosLocales();
    });
  }

  buscarAreas(): void {
    this.paginaActual = 0;
    this.aplicarFiltrosLocales();
  }

  aplicarFiltrosLocales(): void {
    const filtros = this.formularioFiltro.value;
    let resultados = [...this.listaAreasGlobal];

    if (filtros.termino && filtros.termino.trim() !== '') {
      const termino = filtros.termino.toLowerCase();
      resultados = resultados.filter(a => 
        (a.nombre && a.nombre.toLowerCase().includes(termino)) ||
        (a.normasUso && a.normasUso.toLowerCase().includes(termino))
      );
    }

    if (filtros.aforo) {
      if (filtros.aforo === '1-10') {
        resultados = resultados.filter(a => a.capacidad <= 10);
      } else if (filtros.aforo === '11-30') {
        resultados = resultados.filter(a => a.capacidad > 10 && a.capacidad <= 30);
      } else if (filtros.aforo === '31+') {
        resultados = resultados.filter(a => a.capacidad > 30);
      }
    }

    this.listaAreasFiltradas = resultados;
    this.totalPaginas = Math.ceil(this.listaAreasFiltradas.length / this.tamanoPagina) || 1;
    if (this.paginaActual >= this.totalPaginas) {
      this.paginaActual = 0;
    }
    this.actualizarPagina();
  }

  actualizarPagina(): void {
    const inicio = this.paginaActual * this.tamanoPagina;
    const fin = inicio + this.tamanoPagina;
    this.listaAreas = this.listaAreasFiltradas.slice(inicio, fin);
  }

  limpiarFiltros(): void {
    this.formularioFiltro.reset({
      termino: '',
      aforo: ''
    });
    this.buscarAreas();
  }

  cambiarPagina(nuevaPagina: number): void {
    this.paginaActual = nuevaPagina;
    this.actualizarPagina();
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
          this.obtenerDatos();
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
