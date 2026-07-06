import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { EstadoCuentaResponse, UnidadResumen } from '../../modelos/finanzas.model';
import { FormularioPagoComponent } from '../formulario-pago/formulario-pago';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';
import { PaginacionComponent } from '../../../../compartido/componentes/paginacion/paginacion';
import { SelectPersonalizadoComponent } from '../../../../compartido/componentes/select-personalizado/select-personalizado';
import { CalendarioPersonalizadoComponent } from '../../../../compartido/componentes/calendario-personalizado/calendario-personalizado';
import { MenuContextualComponent } from '../../../../compartido/componentes/menu-contextual/menu-contextual';

@Component({
  selector: 'app-lista-resumen-mensual',
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
  templateUrl: './lista-resumen-mensual.html',
  styleUrls: ['./lista-resumen-mensual.scss']
})
export class ListaResumenMensualComponent implements OnInit, OnChanges {
  @Input() estadosOriginales: EstadoCuentaResponse[] = [];
  @Input() unidad: UnidadResumen | null = null;
  @Output() pagoRegistrado = new EventEmitter<void>();

  estadosFiltrados: EstadoCuentaResponse[] = [];
  estadosPaginados: EstadoCuentaResponse[] = [];
  filtroEstados: FormGroup;
  paginaActualEstados = 1;
  totalPaginasEstados = 1;
  elementosPorPagina = 6;

  mostrarModalPago = false;
  estadoCuentaSeleccionadoId: number | null = null;
  saldoSeleccionado: number = 0;

  mostrarModalDetalle = false;
  estadoDetalleSeleccionado: EstadoCuentaResponse | null = null;

  opcionesEstadoCuenta = [
    { valor: 'AL_DIA', etiqueta: 'Al Día' },
    { valor: 'MOROSO', etiqueta: 'Moroso' }
  ];

  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  constructor() {
    this.filtroEstados = this.fb.group({
      estado: [''],
      periodo: ['']
    });
  }

  ngOnInit(): void {
    this.aplicarFiltrosIniciales();
  }

  aplicarFiltrosIniciales(): void {
    this.estadosFiltrados = [...this.estadosOriginales];
    this.totalPaginasEstados = Math.ceil(this.estadosFiltrados.length / this.elementosPorPagina) || 1;
    this.cambiarPaginaEstados(1);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['estadosOriginales']) {
      if (this.busquedaRealizada) {
        this.aplicarFiltrosEstados();
      } else {
        this.aplicarFiltrosIniciales();
      }
    }
  }

  busquedaRealizada = false;

  aplicarFiltrosEstados(): void {
    this.busquedaRealizada = true;
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
    this.busquedaRealizada = false;
    this.filtroEstados.reset({ estado: '', periodo: '' });
    this.aplicarFiltrosIniciales();
  }

  cambiarPaginaEstados(pagina: number): void {
    this.paginaActualEstados = pagina;
    const inicio = (pagina - 1) * this.elementosPorPagina;
    this.estadosPaginados = this.estadosFiltrados.slice(inicio, inicio + this.elementosPorPagina);
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
    this.pagoRegistrado.emit();
  }

  abrirModalDetalleEstado(estado: EstadoCuentaResponse): void {
    this.estadoDetalleSeleccionado = estado;
    this.mostrarModalDetalle = true;
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.estadoDetalleSeleccionado = null;
  }

  formatearPeriodo(fecha: string): string {
    const d = new Date(fecha);
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${meses[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  }
}
