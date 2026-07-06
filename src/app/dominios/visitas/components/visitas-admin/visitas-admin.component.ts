import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { VisitaService } from '../../services/visita.service';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';
import { VisitaResponse, EstadoVisita } from '../../models/visita.model';
import { SelectPersonalizadoComponent } from '../../../../compartido/componentes/select-personalizado/select-personalizado';
import { InputBusquedaComponent } from '../../../../compartido/componentes/input-busqueda/input-busqueda';
import { PaginacionComponent } from '../../../../compartido/componentes/paginacion/paginacion';

@Component({
  selector: 'app-visitas-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SelectPersonalizadoComponent, PaginacionComponent, InputBusquedaComponent],
  templateUrl: './visitas-admin.component.html',
  styleUrls: ['./visitas-admin.component.scss']
})
export class VisitasAdminComponent implements OnInit {
  private visitaService = inject(VisitaService);
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

  opcionesEstado: any[] = [
    { valor: '', etiqueta: 'Todos los estados' },
    { valor: EstadoVisita.PRE_REGISTRADA, etiqueta: 'Pre Registrada' },
    { valor: EstadoVisita.INGRESO_REGISTRADO, etiqueta: 'Ingreso Registrado' },
    { valor: EstadoVisita.SALIDA_REGISTRADA, etiqueta: 'Salida Registrada' },
    { valor: EstadoVisita.CANCELADA, etiqueta: 'Cancelada' }
  ];

  ngOnInit(): void {
    this.inicializarFiltros();
    this.cargarUniversoVisitas();
  }

  private inicializarFiltros(): void {
    this.formularioFiltros = this.formBuilder.group({
      terminoBusqueda: [''],
      estado: ['']
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
    this.paginaActual = 0;
    this.aplicarFiltros();
    this.mostrarResultados = true;
  }

  aplicarFiltros(): void {
    const term = (this.formularioFiltros.get('terminoBusqueda')?.value || '').toLowerCase().trim();
    const estado = this.formularioFiltros.get('estado')?.value;

    this.visitasFiltradas = this.todasLasVisitas.filter(v => {
      const coincideTermino = term === '' || 
        v.nombreVisitante.toLowerCase().includes(term) || 
        v.documentoVisitante.toLowerCase().includes(term);
      
      const coincideEstado = estado === '' || v.estado === estado;

      return coincideTermino && coincideEstado;
    });

    this.actualizarPaginacion();
  }

  limpiarFiltros(): void {
    this.formularioFiltros.reset({ terminoBusqueda: '', estado: '' });
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
}
