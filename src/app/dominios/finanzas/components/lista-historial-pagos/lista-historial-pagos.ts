import { Component, Input, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { PagoResponse } from '../../modelos/finanzas.model';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';
import { PaginacionComponent } from '../../../../compartido/componentes/paginacion/paginacion';
import { SelectPersonalizadoComponent } from '../../../../compartido/componentes/select-personalizado/select-personalizado';
import { CalendarioPersonalizadoComponent } from '../../../../compartido/componentes/calendario-personalizado/calendario-personalizado';
import { MenuContextualComponent } from '../../../../compartido/componentes/menu-contextual/menu-contextual';

@Component({
  selector: 'app-lista-historial-pagos',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    PaginacionComponent,
    SelectPersonalizadoComponent,
    CalendarioPersonalizadoComponent,
    MenuContextualComponent
  ],
  templateUrl: './lista-historial-pagos.html',
  styleUrls: ['./lista-historial-pagos.scss']
})
export class ListaHistorialPagosComponent implements OnInit, OnChanges {
  @Input() pagosOriginales: PagoResponse[] = [];

  pagosFiltrados: PagoResponse[] = [];
  pagosPaginados: PagoResponse[] = [];
  filtroPagos: FormGroup;
  paginaActualPagos = 1;
  totalPaginasPagos = 1;
  elementosPorPagina = 6;

  mostrarModalRecibo = false;
  pagoSeleccionado: PagoResponse | null = null;

  opcionesEstadoPago = [
    { valor: 'PENDIENTE', etiqueta: 'Pendiente' },
    { valor: 'APROBADO', etiqueta: 'Aprobado' },
    { valor: 'RECHAZADO', etiqueta: 'Rechazado' }
  ];

  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  constructor() {
    this.filtroPagos = this.fb.group({
      estado: [''],
      periodo: ['']
    });
  }

  ngOnInit(): void {
    this.aplicarFiltrosIniciales();
  }

  aplicarFiltrosIniciales(): void {
    this.pagosFiltrados = [...this.pagosOriginales];
    this.totalPaginasPagos = Math.ceil(this.pagosFiltrados.length / this.elementosPorPagina) || 1;
    this.cambiarPaginaPagos(1);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pagosOriginales']) {
      if (this.busquedaRealizada) {
        this.aplicarFiltrosPagos();
      } else {
        this.aplicarFiltrosIniciales();
      }
    }
  }

  busquedaRealizada = false;

  aplicarFiltrosPagos(): void {
    this.busquedaRealizada = true;
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
    this.busquedaRealizada = false;
    this.filtroPagos.reset({ estado: '', periodo: '' });
    this.aplicarFiltrosIniciales();
  }

  cambiarPaginaPagos(pagina: number): void {
    this.paginaActualPagos = pagina;
    const inicio = (pagina - 1) * this.elementosPorPagina;
    this.pagosPaginados = this.pagosFiltrados.slice(inicio, inicio + this.elementosPorPagina);
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
}
