import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanzasService } from '../../services/finanzas.service';
import { GastoResponse, DistribucionGastoForm } from '../../modelos/finanzas.model';
import { UnidadService } from '../../../unidades/services/unidad';
import { UnidadResponse } from '../../../unidades/modelos/unidad-response.interface';
import { IncidenciasService } from '../../../incidencias/services/incidencias.service';
import { Router, RouterModule } from '@angular/router';
import { MenuContextualComponent } from '../../../../compartido/componentes/menu-contextual/menu-contextual';
import { PaginacionComponent } from '../../../../compartido/componentes/paginacion/paginacion';
import { SelectPersonalizadoComponent } from '../../../../compartido/componentes/select-personalizado/select-personalizado';
import { InputBusquedaComponent } from '../../../../compartido/componentes/input-busqueda/input-busqueda';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ModalConfirmacionComponent } from '../../../../compartido/componentes/modal-confirmacion/modal-confirmacion';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';

@Component({
  selector: 'app-lista-gastos',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule,
    MenuContextualComponent, 
    PaginacionComponent, 
    SelectPersonalizadoComponent,
    InputBusquedaComponent,
    ModalConfirmacionComponent
  ],
  templateUrl: './lista-gastos.html',
  styleUrls: ['./lista-gastos.scss', './tarjeta-gastos.scss', './modal-gastos.scss']
})
export class ListaGastosComponent implements OnInit {
  gastos: GastoResponse[] = [];
  gastosGlobal: GastoResponse[] = [];
  gastosFiltrados: GastoResponse[] = [];

  cargando: boolean = true;
  error: string | null = null;
  exito: string | null = null;
  
  paginaActual: number = 0;
  totalPaginas: number = 0;
  
  mostrarModal: boolean = false;
  gastoSeleccionado: GastoResponse | null = null;

  opcionesTipo = [
    { id: 'FIJO', nombre: 'Fijo' },
    { id: 'EXTRAORDINARIO', nombre: 'Extraordinario' }
  ];

  opcionesEstado = [
    { id: 'DISTRIBUIDO', nombre: 'Distribuido' },
    { id: 'PENDIENTE', nombre: 'Pendiente' }
  ];

  formularioFiltro: FormGroup;

  modalConfirmacionVisible = false;
  modalConfirmacionTitulo = '';
  modalConfirmacionMensaje = '';
  accionPendiente: { tipo: 'ELIMINAR' | 'DISTRIBUIR', id: number } | null = null;

  modalDistribucionVisible = false;
  unidadSeleccionadaId: number | null = null;
  listaUnidades: any[] = [];
  cargandoUnidades = false;

  detalleIncidencia: string | null = null;
  cargandoDetalleIncidencia = false;


  constructor(
    private finanzasService: FinanzasService,
    private router: Router,
    private fb: FormBuilder,
    private toastService: ToastService,
    private unidadService: UnidadService,
    private incidenciasService: IncidenciasService,
    private cdr: ChangeDetectorRef
  ) {
    this.formularioFiltro = this.fb.group({
      termino: [''],
      tipo: [''],
      estado: ['']
    });
  }

  ngOnInit(): void {
    this.cargarGastos();
  }

  cargarGastos(): void {
    this.cargando = true;
    this.finanzasService.listarGastos(undefined, 0, 10000).subscribe({
      next: (data) => {
        this.gastosGlobal = data.content;
        this.cargando = false;
        this.aplicarFiltrosLocales();
      },
      error: (err) => {
        this.error = 'No se pudieron cargar los gastos.';
        this.cargando = false;
        this.gastosGlobal = [];
        this.aplicarFiltrosLocales();
      }
    });
  }

  buscarGastos(): void {
    this.paginaActual = 0;
    this.aplicarFiltrosLocales();
  }

  aplicarFiltrosLocales(): void {
    const filtros = this.formularioFiltro.value;
    let resultados = [...this.gastosGlobal];

    if (filtros.termino && filtros.termino.trim() !== '') {
      const termino = filtros.termino.toLowerCase();
      resultados = resultados.filter(g => 
        (g.descripcion && g.descripcion.toLowerCase().includes(termino)) ||
        (g.nombreUnidadCausante && g.nombreUnidadCausante.toLowerCase().includes(termino)) ||
        (g.condominioNombre && g.condominioNombre.toLowerCase().includes(termino)) ||
        (g.torre && g.torre.toLowerCase().includes(termino))
      );
    }

    if (filtros.tipo) {
      resultados = resultados.filter(g => g.tipoGasto === filtros.tipo);
    }

    if (filtros.estado) {
      if (filtros.estado === 'DISTRIBUIDO') {
        resultados = resultados.filter(g => g.distribuido);
      } else if (filtros.estado === 'PENDIENTE') {
        resultados = resultados.filter(g => !g.distribuido);
      }
    }

    this.gastosFiltrados = resultados;
    this.totalPaginas = Math.ceil(this.gastosFiltrados.length / 9) || 1;
    if (this.paginaActual >= this.totalPaginas) {
      this.paginaActual = 0;
    }
    this.actualizarPagina();
  }

  actualizarPagina(): void {
    const inicio = this.paginaActual * 9;
    const fin = inicio + 9;
    this.gastos = this.gastosFiltrados.slice(inicio, fin);
  }

  limpiarFiltros(): void {
    this.formularioFiltro.reset({
      termino: '',
      tipo: '',
      estado: ''
    });
    this.buscarGastos();
  }

  cambiarPagina(pagina: number): void {
    this.paginaActual = pagina;
    this.actualizarPagina();
  }

  nuevoGasto(): void {
    this.router.navigate(['/finanzas/gastos/nuevo']);
  }

  editarGasto(id: number): void {
    this.router.navigate(['/finanzas/gastos/editar', id]);
  }

  eliminarGasto(id: number): void {
    this.accionPendiente = { tipo: 'ELIMINAR', id };
    this.modalConfirmacionTitulo = 'Eliminar Gasto';
    this.modalConfirmacionMensaje = '¿Está seguro de eliminar este gasto? Esta acción no se puede deshacer.';
    this.modalConfirmacionVisible = true;
  }

  distribuirGasto(id: number): void {
    const gasto = this.gastos.find(g => g.id === id);
    if (!gasto) return;

    this.accionPendiente = { tipo: 'DISTRIBUIR', id };

    if (gasto.metodoDistribucion === 'COBRO_DIRECTO') {
      this.modalDistribucionVisible = true;
      this.cargandoUnidades = true;
      this.unidadSeleccionadaId = null;
      this.listaUnidades = [];

      this.unidadService.obtenerListaUnidades(0, 10000).subscribe({
        next: (resp) => {
          this.listaUnidades = resp.contenido
            .filter(u => u.condominioId === gasto.condominioId)
            .filter(u => !gasto.torre || u.torre === gasto.torre)
            .map(u => {
              const prefijoTorre = u.torre 
                ? (u.torre.toLowerCase().includes('torre') ? u.torre : `Torre ${u.torre}`) + ' - ' 
                : '';
              return {
                id: u.id,
                nombre: `${prefijoTorre}Depto. ${u.numeroUnidad}`
              };
            });
          this.cargandoUnidades = false;
        },
        error: () => {
          this.toastService.mostrarError('Error al cargar unidades');
          this.cargandoUnidades = false;
          this.cerrarModalDistribucion();
        }
      });
    } else {
      this.modalConfirmacionTitulo = 'Distribuir Gasto';
      this.modalConfirmacionMensaje = '¿Está seguro de distribuir este gasto? Las cuotas se asignarán permanentemente.';
      this.modalConfirmacionVisible = true;
    }
  }

  confirmarDistribucionDirecta(): void {
    if (!this.accionPendiente || !this.unidadSeleccionadaId) {
      this.toastService.mostrarError('Debe seleccionar una unidad');
      return;
    }

    const form: DistribucionGastoForm = { 
      gastoId: this.accionPendiente.id,
      unidadId: this.unidadSeleccionadaId
    };

    this.finanzasService.distribuirGasto(form).subscribe({
      next: () => {
        this.toastService.mostrarExito('Gasto distribuido exitosamente');
        this.cargarGastos();
        this.cerrarModalDistribucion();
      },
      error: (err) => {
        this.toastService.mostrarError(err.error?.error || 'Error al distribuir gasto');
        this.cerrarModalDistribucion();
      }
    });
  }

  cerrarModalDistribucion(): void {
    this.modalDistribucionVisible = false;
    this.accionPendiente = null;
    this.unidadSeleccionadaId = null;
    this.listaUnidades = [];
  }

  confirmarAccion(): void {
    if (!this.accionPendiente) return;

    if (this.accionPendiente.tipo === 'ELIMINAR') {
      this.finanzasService.eliminarGasto(this.accionPendiente.id).subscribe({
        next: () => {
          this.toastService.mostrarExito('Gasto eliminado exitosamente');
          this.cargarGastos();
          this.cerrarModalConfirmacion();
        },
        error: (err) => {
          this.toastService.mostrarError('Error al eliminar el gasto');
          this.cerrarModalConfirmacion();
        }
      });
    } else if (this.accionPendiente.tipo === 'DISTRIBUIR') {
      const form: DistribucionGastoForm = { gastoId: this.accionPendiente.id };
      this.finanzasService.distribuirGasto(form).subscribe({
        next: () => {
          this.toastService.mostrarExito('Gasto distribuido exitosamente');
          this.cargarGastos();
          this.cerrarModalConfirmacion();
        },
        error: (err) => {
          this.toastService.mostrarError(err.error?.error || 'Error al distribuir gasto');
          this.cerrarModalConfirmacion();
        }
      });
    }
  }

  cancelarAccion(): void {
    this.cerrarModalConfirmacion();
  }

  cerrarModalConfirmacion(): void {
    this.modalConfirmacionVisible = false;
    this.accionPendiente = null;
  }

  abrirModalDetalle(id: number): void {
    this.gastoSeleccionado = this.gastos.find(g => g.id === id) || null;
    if (this.gastoSeleccionado) {
      this.mostrarModal = true;
      this.detalleIncidencia = null;
      this.cargandoDetalleIncidencia = false;


      if (this.gastoSeleccionado.tipoGasto === 'EXTRAORDINARIO' && this.gastoSeleccionado.incidenciaId) {
        this.cargandoDetalleIncidencia = true;
        this.incidenciasService.obtenerIncidencia(this.gastoSeleccionado.incidenciaId).subscribe({
          next: (inc) => {
            this.detalleIncidencia = inc.descripcion;
            this.cargandoDetalleIncidencia = false;
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Error fetching incidencia:', err);
            this.cargandoDetalleIncidencia = false;
            this.cdr.detectChanges();
          }
        });
      }


    }
  }

  cerrarModalDetalle(): void {
    this.mostrarModal = false;
    this.gastoSeleccionado = null;
  }

  cerrarModalFondo(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('fondo-modal')) {
      this.cerrarModalDetalle();
    }
  }
}
