import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { FinanzasService } from '../../services/finanzas.service';
import { EstadoCuentaResponse, PagoResponse } from '../../modelos/finanzas.model';
import { FormularioPagoComponent } from '../formulario-pago/formulario-pago';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';
import { PaginacionComponent } from '../../../../compartido/componentes/paginacion/paginacion';
import { SelectPersonalizadoComponent } from '../../../../compartido/componentes/select-personalizado/select-personalizado';
import { CalendarioPersonalizadoComponent } from '../../../../compartido/componentes/calendario-personalizado/calendario-personalizado';
import { MenuContextualComponent } from '../../../../compartido/componentes/menu-contextual/menu-contextual';

@Component({
  selector: 'app-mi-estado-cuenta',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    FormularioPagoComponent, 
    PaginacionComponent,
    SelectPersonalizadoComponent,
    CalendarioPersonalizadoComponent,
    MenuContextualComponent
  ],
  templateUrl: './mi-estado-cuenta.html',
  styleUrl: './mi-estado-cuenta.scss'
})
export class MiEstadoCuentaComponent implements OnInit {
  unidad: any = null;
  cargando = true;
  pestanaActiva: 'estados' | 'pagos' = 'estados';

  estadosOriginales: EstadoCuentaResponse[] = [];
  estadosFiltrados: EstadoCuentaResponse[] = [];
  estadosPaginados: EstadoCuentaResponse[] = [];
  filtroEstados: FormGroup;
  paginaActualEstados = 1;
  totalPaginasEstados = 1;

  pagosOriginales: PagoResponse[] = [];
  pagosFiltrados: PagoResponse[] = [];
  pagosPaginados: PagoResponse[] = [];
  filtroPagos: FormGroup;
  paginaActualPagos = 1;
  totalPaginasPagos = 1;

  elementosPorPagina = 6;

  mostrarModalPago = false;
  estadoCuentaSeleccionadoId: number | null = null;
  saldoSeleccionado: number = 0;

  mostrarModalDetalle = false;
  estadoDetalleSeleccionado: EstadoCuentaResponse | null = null;

  mostrarModalRecibo = false;
  pagoSeleccionado: PagoResponse | null = null;

  opcionesEstadoCuenta = [
    { valor: 'AL_DIA', etiqueta: 'Al Día' },
    { valor: 'MOROSO', etiqueta: 'Moroso' }
  ];

  opcionesEstadoPago = [
    { valor: 'PENDIENTE', etiqueta: 'Pendiente' },
    { valor: 'APROBADO', etiqueta: 'Aprobado' },
    { valor: 'RECHAZADO', etiqueta: 'Rechazado' }
  ];

  constructor(
    private finanzasService: FinanzasService,
    private fb: FormBuilder,
    private toastService: ToastService
  ) {
    this.filtroEstados = this.fb.group({
      estado: [''],
      periodo: ['']
    });

    this.filtroPagos = this.fb.group({
      estado: [''],
      periodo: ['']
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.finanzasService.verMiEstadoCuenta().subscribe({
      next: (data) => {
        this.unidad = data.unidad;
        this.estadosOriginales = data.estadosCuenta.sort((a: EstadoCuentaResponse, b: EstadoCuentaResponse) => {
          return new Date(b.periodo).getTime() - new Date(a.periodo).getTime();
        });

        this.pagosOriginales = data.pagos.sort((a: PagoResponse, b: PagoResponse) => {
          return new Date(b.fechaPago).getTime() - new Date(a.fechaPago).getTime();
        });
        
        this.aplicarFiltrosEstados();
        this.aplicarFiltrosPagos();
        
        this.cargando = false;
      },
      error: (err) => {
        this.toastService.mostrarError('Error al cargar la información financiera.');
        this.cargando = false;
      }
    });
  }

  cambiarPestana(pestana: 'estados' | 'pagos'): void {
    this.pestanaActiva = pestana;
  }

  aplicarFiltrosEstados(): void {
    const estado = this.filtroEstados.get('estado')?.value;
    const periodo = this.filtroEstados.get('periodo')?.value;

    this.estadosFiltrados = this.estadosOriginales.filter(est => {
      let coincideEstado = true;
      if (estado === 'MOROSO') coincideEstado = est.saldo > 0;
      if (estado === 'AL_DIA') coincideEstado = est.saldo <= 0;

      let coincidePeriodo = true;
      if (periodo) {
        const fechaFiltro = new Date(periodo);
        const fechaEstado = new Date(est.periodo);
        coincidePeriodo = fechaFiltro.getMonth() === fechaEstado.getMonth() &&
                          fechaFiltro.getFullYear() === fechaEstado.getFullYear();
      }

      return coincideEstado && coincidePeriodo;
    });

    this.totalPaginasEstados = Math.ceil(this.estadosFiltrados.length / this.elementosPorPagina) || 1;
    this.cambiarPaginaEstados(1);
  }

  limpiarFiltrosEstados(): void {
    this.filtroEstados.reset({ estado: '', periodo: '' });
    this.aplicarFiltrosEstados();
  }

  cambiarPaginaEstados(pagina: number): void {
    this.paginaActualEstados = pagina;
    const inicio = (pagina - 1) * this.elementosPorPagina;
    this.estadosPaginados = this.estadosFiltrados.slice(inicio, inicio + this.elementosPorPagina);
  }

  aplicarFiltrosPagos(): void {
    const estado = this.filtroPagos.get('estado')?.value;
    const periodo = this.filtroPagos.get('periodo')?.value;

    this.pagosFiltrados = this.pagosOriginales.filter(pago => {
      let coincideEstado = true;
      if (estado) coincideEstado = pago.estado === estado;

      let coincidePeriodo = true;
      if (periodo) {
        const fechaFiltro = new Date(periodo);
        const fechaPago = new Date(pago.fechaPago);
        coincidePeriodo = fechaFiltro.getMonth() === fechaPago.getMonth() &&
                          fechaFiltro.getFullYear() === fechaPago.getFullYear();
      }

      return coincideEstado && coincidePeriodo;
    });

    this.totalPaginasPagos = Math.ceil(this.pagosFiltrados.length / this.elementosPorPagina) || 1;
    this.cambiarPaginaPagos(1);
  }

  limpiarFiltrosPagos(): void {
    this.filtroPagos.reset({ estado: '', periodo: '' });
    this.aplicarFiltrosPagos();
  }

  cambiarPaginaPagos(pagina: number): void {
    this.paginaActualPagos = pagina;
    const inicio = (pagina - 1) * this.elementosPorPagina;
    this.pagosPaginados = this.pagosFiltrados.slice(inicio, inicio + this.elementosPorPagina);
  }
  
  abrirModalPago(estadoCuentaId: number): void {
    const estadoCuenta = this.estadosOriginales.find(e => e.id === estadoCuentaId);
    if (!estadoCuenta || estadoCuenta.saldo <= 0) {
      this.toastService.mostrarError('No hay saldo pendiente para este periodo.');
      return;
    }
    
    this.estadoCuentaSeleccionadoId = estadoCuenta.id;
    this.saldoSeleccionado = estadoCuenta.saldo;
    this.mostrarModalPago = true;
  }

  cerrarModalPago(): void {
    this.mostrarModalPago = false;
    this.estadoCuentaSeleccionadoId = null;
    this.saldoSeleccionado = 0;
  }

  onPagoRegistrado(): void {
    this.cerrarModalPago();
    this.cargarDatos(); 
  }

  abrirModalDetalleEstado(estado: EstadoCuentaResponse): void {
    this.estadoDetalleSeleccionado = estado;
    this.mostrarModalDetalle = true;
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.estadoDetalleSeleccionado = null;
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

  formatearPeriodo(fecha: string): string {
    const d = new Date(fecha);
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${meses[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  }
}
