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
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputBusquedaComponent } from '../../../../compartido/componentes/input-busqueda/input-busqueda';


@Component({
  selector: 'app-lista-unidades',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, MenuContextualComponent, PaginacionComponent, ModalConfirmacionComponent, InputBusquedaComponent],
  templateUrl: './lista-unidades.html',
  styleUrls: ['./lista-unidades.scss']
})
export class ListaUnidadesComponent implements OnInit {
  private unidadServicio = inject(UnidadService);
  private enrutador = inject(Router);
  private toastServicio = inject(ToastService);
  
  listaUnidades: UnidadResponse[] = [];
  listaUnidadesGlobal: UnidadResponse[] = [];
  listaUnidadesFiltradas: UnidadResponse[] = [];

  cargando = false;

  paginaActual = 0;
  tamanoPagina = 9;
  totalPaginas = 1;

  mostrarModalEliminar = false;
  idUnidadAEliminar: number | null = null;

  formularioFiltro: FormGroup;

  constructor(private fb: FormBuilder) {
    this.formularioFiltro = this.fb.group({
      termino: ['']
    });
  }

  ngOnInit(): void {
    this.obtenerDatos();
  }

  obtenerDatos(): void {
    this.cargando = true;
    this.unidadServicio.obtenerListaUnidades(0, 10000).subscribe({
      next: (data) => {
        this.listaUnidadesGlobal = data.contenido;
        this.cargando = false;
        this.aplicarFiltrosLocales();
      },
      error: () => {
        this.cargando = false;
        this.toastServicio.mostrarError('Error al cargar unidades.');
      }
    });
  }


  buscarUnidades(): void {
    this.paginaActual = 0;
    this.aplicarFiltrosLocales();
  }

  aplicarFiltrosLocales(): void {
    const filtros = this.formularioFiltro.value;
    let resultados = [...this.listaUnidadesGlobal];

    if (filtros.termino && filtros.termino.trim() !== '') {
      const termino = filtros.termino.toLowerCase();
      resultados = resultados.filter(u => 
        u.numeroUnidad.toLowerCase().includes(termino) || 
        u.nombreCondominio.toLowerCase().includes(termino)
      );
    }



    this.listaUnidadesFiltradas = resultados;
    this.totalPaginas = Math.ceil(this.listaUnidadesFiltradas.length / this.tamanoPagina) || 1;
    if (this.paginaActual >= this.totalPaginas) {
      this.paginaActual = 0;
    }
    this.actualizarPagina();
  }

  actualizarPagina(): void {
    const inicio = this.paginaActual * this.tamanoPagina;
    const fin = inicio + this.tamanoPagina;
    this.listaUnidades = this.listaUnidadesFiltradas.slice(inicio, fin);
  }

  limpiarFiltros(): void {
    this.formularioFiltro.reset({
      termino: ''
    });
    this.buscarUnidades();
  }

  cambiarPagina(nuevaPagina: number): void {
    this.paginaActual = nuevaPagina;
    this.actualizarPagina();
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
