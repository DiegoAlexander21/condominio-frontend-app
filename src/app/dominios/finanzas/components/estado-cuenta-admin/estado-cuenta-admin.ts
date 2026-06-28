import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { FinanzasService } from '../../services/finanzas.service';
import { EstadoCuentaResponse } from '../../modelos/finanzas.model';
import { Router, RouterModule } from '@angular/router';
import { MenuContextualComponent } from '../../../../compartido/componentes/menu-contextual/menu-contextual';
import { PaginacionComponent } from '../../../../compartido/componentes/paginacion/paginacion';
import { ModalConfirmacionComponent } from '../../../../compartido/componentes/modal-confirmacion/modal-confirmacion';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';
import { InputBusquedaComponent } from '../../../../compartido/componentes/input-busqueda/input-busqueda';
import { SelectPersonalizadoComponent } from '../../../../compartido/componentes/select-personalizado/select-personalizado';
import { CalendarioPersonalizadoComponent } from '../../../../compartido/componentes/calendario-personalizado/calendario-personalizado';

@Component({
  selector: 'app-estado-cuenta-admin',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule,
    MenuContextualComponent, 
    PaginacionComponent, 
    ModalConfirmacionComponent,
    InputBusquedaComponent,
    SelectPersonalizadoComponent,
    CalendarioPersonalizadoComponent
  ],
  templateUrl: './estado-cuenta-admin.html',
  styleUrls: ['./estado-cuenta-admin.scss']
})
export class EstadoCuentaAdminComponent implements OnInit {
  private finanzasService = inject(FinanzasService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private toastService = inject(ToastService);

  listaEstadosGlobal: EstadoCuentaResponse[] = [];
  listaEstadosFiltrados: EstadoCuentaResponse[] = [];
  estados: EstadoCuentaResponse[] = [];
  
  cargando = true;
  
  paginaActual = 0;
  tamanoPagina = 9;
  totalPaginas = 1;

  formularioFiltro: FormGroup;
  
  mostrarModalEliminar = false;
  idEliminar: number | null = null;

  opcionesEstado = [
    { id: 'al_dia', nombre: 'Al Día' },
    { id: 'moroso', nombre: 'Moroso' }
  ];

  constructor() {
    this.formularioFiltro = this.fb.group({
      unidadDetalles: [''],
      estado: [null],
      periodo: ['']
    });
  }

  ngOnInit(): void {
    this.cargarEstados();
  }

  cargarEstados(): void {
    this.cargando = true;
    this.finanzasService.listarEstadosCuenta().subscribe({
      next: (data) => {
        this.listaEstadosGlobal = data;
        this.cargando = false;
        this.aplicarFiltrosLocales();
      },
      error: () => {
        this.toastService.mostrarError('Error al cargar los estados de cuenta.');
        this.cargando = false;
      }
    });
  }

  buscarEstados(): void {
    this.paginaActual = 0;
    this.aplicarFiltrosLocales();
  }

  aplicarFiltrosLocales(): void {
    const filtros = this.formularioFiltro.value;
    let resultados = [...this.listaEstadosGlobal];

    if (filtros.unidadDetalles && filtros.unidadDetalles.trim() !== '') {
      const termino = filtros.unidadDetalles.toLowerCase();
      resultados = resultados.filter(e => e.unidadDetalles && e.unidadDetalles.toLowerCase().includes(termino));
    }

    if (filtros.estado) {
      if (filtros.estado === 'moroso') {
        resultados = resultados.filter(e => e.saldo > 0);
      } else if (filtros.estado === 'al_dia') {
        resultados = resultados.filter(e => e.saldo <= 0);
      }
    }

    if (filtros.periodo) {
      let fechaBuscada = '';
      if (typeof filtros.periodo === 'string') {
        fechaBuscada = filtros.periodo.substring(0, 7); // YYYY-MM
      } else if (filtros.periodo instanceof Date) {
        const year = filtros.periodo.getFullYear();
        const month = String(filtros.periodo.getMonth() + 1).padStart(2, '0');
        fechaBuscada = `${year}-${month}`;
      }
      
      if (fechaBuscada) {
        resultados = resultados.filter(e => {
          if (!e.periodo) return false;
          let fechaEstado = '';
          if (Array.isArray(e.periodo)) {
            const year = e.periodo[0];
            const month = e.periodo[1].toString().padStart(2, '0');
            fechaEstado = `${year}-${month}`;
          } else if (typeof e.periodo === 'string') {
            fechaEstado = e.periodo.substring(0, 7);
          }
          return fechaEstado === fechaBuscada;
        });
      }
    }

    this.listaEstadosFiltrados = resultados;
    this.totalPaginas = Math.ceil(this.listaEstadosFiltrados.length / this.tamanoPagina) || 1;
    if (this.paginaActual >= this.totalPaginas) {
      this.paginaActual = 0;
    }
    this.actualizarPagina();
  }

  actualizarPagina(): void {
    const inicio = this.paginaActual * this.tamanoPagina;
    const fin = inicio + this.tamanoPagina;
    this.estados = this.listaEstadosFiltrados.slice(inicio, fin);
  }

  limpiarFiltros(): void {
    this.formularioFiltro.reset({
      unidadDetalles: '',
      estado: 'todos',
      periodo: ''
    });
    this.buscarEstados();
  }

  cambiarPagina(nuevaPagina: number): void {
    this.paginaActual = nuevaPagina;
    this.actualizarPagina();
  }

  eliminar(id: number): void {
    this.idEliminar = id;
    this.mostrarModalEliminar = true;
  }

  cancelarEliminacion(): void {
    this.mostrarModalEliminar = false;
    this.idEliminar = null;
  }

  confirmarEliminacion(): void {
    if (this.idEliminar !== null) {
      this.finanzasService.eliminarEstadoCuenta(this.idEliminar).subscribe({
        next: () => {
          this.toastService.mostrarExito('Estado de cuenta eliminado exitosamente.');
          this.mostrarModalEliminar = false;
          this.idEliminar = null;
          this.cargarEstados();
        },
        error: () => {
          this.toastService.mostrarError('Error al eliminar estado de cuenta.');
          this.mostrarModalEliminar = false;
          this.idEliminar = null;
        }
      });
    }
  }

  formatearPeriodo(fecha: string): string {
    const d = new Date(fecha);
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${meses[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  }
}
