import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { FinanzasService } from '../../services/finanzas.service';
import { PagoResponse } from '../../modelos/finanzas.model';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';
import { ModalConfirmacionComponent } from '../../../../compartido/componentes/modal-confirmacion/modal-confirmacion';
import { MenuContextualComponent } from '../../../../compartido/componentes/menu-contextual/menu-contextual';
import { PaginacionComponent } from '../../../../compartido/componentes/paginacion/paginacion';
import { InputBusquedaComponent } from '../../../../compartido/componentes/input-busqueda/input-busqueda';
import { SelectPersonalizadoComponent } from '../../../../compartido/componentes/select-personalizado/select-personalizado';
import { CalendarioPersonalizadoComponent } from '../../../../compartido/componentes/calendario-personalizado/calendario-personalizado';

@Component({
  selector: 'app-gestion-pagos',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    ModalConfirmacionComponent,
    MenuContextualComponent,
    PaginacionComponent,
    InputBusquedaComponent,
    SelectPersonalizadoComponent,
    CalendarioPersonalizadoComponent
  ],
  templateUrl: './gestion-pagos.html',
  styleUrls: ['./gestion-pagos.scss']
})
export class GestionPagosComponent implements OnInit {
  pagosGlobal: PagoResponse[] = [];
  pagosFiltrados: PagoResponse[] = [];
  pagos: PagoResponse[] = [];
  
  cargando = true;

  paginaActual = 0;
  tamanoPagina = 9;
  totalPaginas = 1;

  formularioFiltro: FormGroup;

  modalConfirmacionVisible = false;
  modalConfirmacionTitulo = '';
  modalConfirmacionMensaje = '';
  pagoIdSeleccionado: number | null = null;
  accionActual: boolean | null = null; 

  mostrarModalRecibo = false;
  pagoSeleccionado: PagoResponse | null = null; 

  opcionesEstado = [
    { id: '', nombre: 'Todos los estados' },
    { id: 'PENDIENTE', nombre: 'Pendientes' },
    { id: 'APROBADO', nombre: 'Aprobados' },
    { id: 'RECHAZADO', nombre: 'Rechazados' }
  ];

  private finanzasService = inject(FinanzasService);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  constructor() {
    this.formularioFiltro = this.fb.group({
      termino: [''],
      periodo: [''],
      estado: ['']
    });
  }

  ngOnInit(): void {
    this.cargarPagos();
  }

  cargarPagos(): void {
    this.cargando = true;
    this.finanzasService.listarPagos(undefined, 0, 10000).subscribe({
      next: (data) => {
        this.pagosGlobal = data.contenido;
        this.cargando = false;
        this.aplicarFiltrosLocales();
      },
      error: () => {
        this.toastService.mostrarError('Error al cargar pagos');
        this.cargando = false;
      }
    });
  }

  buscarPagos(): void {
    this.paginaActual = 0;
    this.aplicarFiltrosLocales();
  }

  aplicarFiltrosLocales(): void {
    const filtros = this.formularioFiltro.value;
    let resultados = [...this.pagosGlobal];

    if (filtros.termino && filtros.termino.trim() !== '') {
      const busqueda = filtros.termino.toLowerCase();
      resultados = resultados.filter(p => 
        (p.unidadDetalles && p.unidadDetalles.toLowerCase().includes(busqueda)) ||
        (p.observacion && p.observacion.toLowerCase().includes(busqueda))
      );
    }

    if (filtros.periodo) {
      const mesFiltro = filtros.periodo.getMonth();
      const anioFiltro = filtros.periodo.getFullYear();
      resultados = resultados.filter(p => {
        if (!p.fechaPago) return false;
        const fecha = new Date(p.fechaPago);
        return fecha.getUTCMonth() === mesFiltro && fecha.getUTCFullYear() === anioFiltro;
      });
    }

    if (filtros.estado) {
      resultados = resultados.filter(p => p.estado === filtros.estado);
    }

    this.pagosFiltrados = resultados;
    this.totalPaginas = Math.ceil(this.pagosFiltrados.length / this.tamanoPagina) || 1;
    if (this.paginaActual >= this.totalPaginas) {
      this.paginaActual = 0;
    }
    this.actualizarPagina();
  }

  actualizarPagina(): void {
    const inicio = this.paginaActual * this.tamanoPagina;
    const fin = inicio + this.tamanoPagina;
    this.pagos = this.pagosFiltrados.slice(inicio, fin);
  }

  cambiarPagina(nuevaPagina: number): void {
    this.paginaActual = nuevaPagina;
    this.actualizarPagina();
  }

  limpiarFiltros(): void {
    this.formularioFiltro.reset({
      termino: '',
      periodo: '',
      estado: ''
    });
    this.buscarPagos();
  }

  abrirModalConfirmacion(id: number, aprobar: boolean): void {
    this.pagoIdSeleccionado = id;
    this.accionActual = aprobar;
    const pago = this.pagosGlobal.find(p => p.id === id);
    const tipoStr = aprobar ? 'APROBAR' : 'RECHAZADO';
    this.modalConfirmacionTitulo = `${aprobar ? 'Aprobar' : 'Rechazar'} Pago`;
    this.modalConfirmacionMensaje = `¿Está seguro de ${tipoStr} el pago de S/ ${pago?.monto} para la unidad ${pago?.unidadDetalles}?`;
    this.modalConfirmacionVisible = true;
  }

  cancelarProceso(): void {
    this.modalConfirmacionVisible = false;
    this.pagoIdSeleccionado = null;
    this.accionActual = null;
  }

  verRecibo(pago: PagoResponse): void {
    if (pago.evidencias && pago.evidencias.length > 0) {
      this.pagoSeleccionado = pago;
      this.mostrarModalRecibo = true;
    } else {
      this.toastService.mostrarError('No hay recibo disponible para este pago.');
    }
  }

  cerrarModalRecibo(): void {
    this.mostrarModalRecibo = false;
    this.pagoSeleccionado = null;
  }

  cerrarModalFondo(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.cerrarModalRecibo();
    }
  }

  procesarPago(): void {
    if (this.pagoIdSeleccionado !== null && this.accionActual !== null) {
      const aprobar = this.accionActual;
      
      this.finanzasService.aprobarPago(this.pagoIdSeleccionado, { aprobar, observacionAdmin: '' }).subscribe({
        next: () => {
          this.toastService.mostrarExito(`Pago ${aprobar ? 'aprobado' : 'rechazado'} correctamente.`);
          this.cargarPagos(); 
        },
        error: (err) => this.toastService.mostrarError(err.error?.error || 'Error al procesar el pago')
      });
    }
    this.cancelarProceso();
  }
}
