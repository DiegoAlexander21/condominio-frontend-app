import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { VisitaService } from '../../services/visita.service';
import { CondominioService } from '../../../condominio/services/condominio.service';
import { UnidadService } from '../../../unidades/services/unidad';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';
import { VisitaResponse, EstadoVisita } from '../../modelos/visita.model';
import { SelectPersonalizadoComponent } from '../../../../compartido/componentes/select-personalizado/select-personalizado';
import { PaginacionComponent } from '../../../../compartido/componentes/paginacion/paginacion';
import { CalendarioPersonalizadoComponent } from '../../../../compartido/componentes/calendario-personalizado/calendario-personalizado';

@Component({
  selector: 'app-visitas-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SelectPersonalizadoComponent, PaginacionComponent, CalendarioPersonalizadoComponent],
  templateUrl: './visitas-admin.component.html',
  styleUrls: ['./visitas-admin.component.scss']
})
export class VisitasAdminComponent implements OnInit {
  private visitaService = inject(VisitaService);
  private condominioService = inject(CondominioService);
  private unidadService = inject(UnidadService);
  private toastService = inject(ToastService);
  private formBuilder = inject(FormBuilder);

  formularioFiltros!: FormGroup;

  todasLasVisitas: VisitaResponse[] = [];
  visitasFiltradas: VisitaResponse[] = [];
  mostrarResultados: boolean = false;

  paginaActual: number = 0;
  tamanoPagina: number = 10;
  visitasPaginadas: VisitaResponse[] = [];
  totalPaginas: number = 0;

  listaCondominios: any[] = [];
  listaUnidades: any[] = [];
  todasLasUnidades: any[] = [];

  opcionesEstado: any[] = [
    { valor: '', etiqueta: 'Todos los estados' },
    { valor: EstadoVisita.PRE_REGISTRADA, etiqueta: 'Pre Registrada' },
    { valor: EstadoVisita.INGRESO_REGISTRADO, etiqueta: 'Ingreso Registrado' },
    { valor: EstadoVisita.SALIDA_REGISTRADA, etiqueta: 'Salida Registrada' },
    { valor: EstadoVisita.CANCELADA, etiqueta: 'Cancelada' }
  ];

  ngOnInit(): void {
    this.inicializarFiltros();
    this.cargarCondominiosYUnidades();
    this.cargarUniversoVisitas();
  }

  private inicializarFiltros(): void {
    this.formularioFiltros = this.formBuilder.group({
      condominioId: [''],
      unidadId: [''],
      fechaFiltro: ['']
    });

    this.formularioFiltros.get('condominioId')?.valueChanges.subscribe(condominioId => {
      this.formularioFiltros.patchValue({ unidadId: '' });
      if (condominioId) {
        const condId = Number(condominioId);
        this.listaUnidades = this.todasLasUnidades
          .filter(u => u.condominioId === condId)
          .map(u => ({ valor: u.id, etiqueta: `Torre ${u.torre} - Depto ${u.numeroUnidad}` }));
      } else {
        this.listaUnidades = [];
      }
    });
  }

  private cargarCondominiosYUnidades(): void {
    this.condominioService.obtenerListaCondominios(0, 100).subscribe({
      next: (res) => {
        this.listaCondominios = res.contenido.map(c => ({ valor: c.id, etiqueta: c.nombre }));
      }
    });

    this.unidadService.obtenerListaUnidades(0, 1000).subscribe({
      next: (res) => {
        this.todasLasUnidades = res.contenido;
      }
    });
  }

  cargarUniversoVisitas(): void {
    this.visitaService.listarVisitas().subscribe({
      next: (data) => {
        this.todasLasVisitas = data.sort((a, b) => new Date(b.fechaRegistro).getTime() - new Date(a.fechaRegistro).getTime());
      },
      error: () => this.toastService.mostrarError('Error al cargar historial de visitas')
    });
  }

  buscar(): void {
    if (!this.formularioFiltros.get('condominioId')?.value) {
      this.toastService.mostrarAdvertencia('Debe seleccionar al menos un Condominio para buscar');
      return;
    }
    if (!this.formularioFiltros.get('unidadId')?.value) {
      this.toastService.mostrarAdvertencia('Debe seleccionar una unidad');
      return;
    }
    this.paginaActual = 0;
    this.aplicarFiltros();
    this.mostrarResultados = true;
  }

  aplicarFiltros(): void {
    const condominioId = this.formularioFiltros.get('condominioId')?.value;
    const unidadId = this.formularioFiltros.get('unidadId')?.value;
    const fechaFiltro = this.formularioFiltros.get('fechaFiltro')?.value;

    this.visitasFiltradas = this.todasLasVisitas.filter(v => {
      let coincideUnidadOCondominio = true;
      if (unidadId) {
        coincideUnidadOCondominio = v.unidadId === Number(unidadId);
      } else if (condominioId) {
        coincideUnidadOCondominio = this.listaUnidades.some(u => u.valor === v.unidadId);
      }
      
      let coincideFecha = true;
      if (fechaFiltro) {
        const fechaVisita = v.fechaVisitaProgramada.split('T')[0];
        coincideFecha = fechaVisita === fechaFiltro;
      }

      return coincideUnidadOCondominio && coincideFecha;
    });

    this.actualizarPaginacion();
  }

  limpiarFiltros(): void {
    this.formularioFiltros.reset({ condominioId: '', unidadId: '', fechaFiltro: '' });
    this.mostrarResultados = false;
    this.visitasFiltradas = [];
    this.visitasPaginadas = [];
    this.paginaActual = 0;
    this.totalPaginas = 0;
  }

  actualizarPaginacion(): void {
    this.totalPaginas = Math.ceil(this.visitasFiltradas.length / this.tamanoPagina);
    if (this.paginaActual >= this.totalPaginas && this.totalPaginas > 0) {
      this.paginaActual = this.totalPaginas - 1;
    }
    const inicio = this.paginaActual * this.tamanoPagina;
    const fin = inicio + this.tamanoPagina;
    this.visitasPaginadas = this.visitasFiltradas.slice(inicio, fin);
  }

  cambiarPagina(nuevaPagina: number): void {
    this.paginaActual = nuevaPagina;
    this.actualizarPaginacion();
  }

  formatearEstado(estadoId: string): string {
    const opcion = this.opcionesEstado.find(op => op.valor === estadoId);
    return opcion ? opcion.etiqueta : estadoId;
  }
}
