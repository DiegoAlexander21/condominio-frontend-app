import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AutenticacionService } from '../../../../nucleo/servicios/autenticacion.service';
import { VisitaService } from '../../services/visita.service';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';
import { VisitaResponse } from '../../models/visita.model';
import { PaginacionComponent } from '../../../../compartido/componentes/paginacion/paginacion';
import { InputBusquedaComponent } from '../../../../compartido/componentes/input-busqueda/input-busqueda';
import { SelectPersonalizadoComponent } from '../../../../compartido/componentes/select-personalizado/select-personalizado';
import { CalendarioPersonalizadoComponent } from '../../../../compartido/componentes/calendario-personalizado/calendario-personalizado';
import { MenuContextualComponent } from '../../../../compartido/componentes/menu-contextual/menu-contextual';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-visitas-residente',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    PaginacionComponent,
    InputBusquedaComponent,
    SelectPersonalizadoComponent,
    CalendarioPersonalizadoComponent,
    MenuContextualComponent,
    RouterLink
  ],
  templateUrl: './visitas-residente.component.html',
  styleUrls: ['./visitas-residente.component.scss']
})
export class VisitasResidenteComponent implements OnInit {
  private authService = inject(AutenticacionService);
  private visitaService = inject(VisitaService);
  private toastService = inject(ToastService);
  private formBuilder = inject(FormBuilder);

  formularioFiltro!: FormGroup;
  unidadId: number | null = null;
  visitas: VisitaResponse[] = [];
  visitasGlobal: VisitaResponse[] = [];
  
  paginaActual: number = 0;
  tamanoPagina: number = 5;
  visitasPaginadas: VisitaResponse[] = [];
  totalPaginas: number = 0;
  cargando: boolean = true;

  opcionesEstado = [
    { id: '', nombre: 'Cualquier estado' },
    { id: 'PRE_REGISTRADA', nombre: 'Pre-Registrada' },
    { id: 'INGRESO_REGISTRADO', nombre: 'Ingreso Registrado' },
    { id: 'SALIDA_REGISTRADA', nombre: 'Salida Registrada' },
    { id: 'CANCELADA', nombre: 'Cancelada' }
  ];

  ngOnInit(): void {
    this.unidadId = this.authService.obtenerUnidadId();
    this.inicializarFormulario();
    if (this.unidadId) {
      this.cargarVisitas();
    } else {
      this.toastService.mostrarError('No se detectó una unidad asociada al usuario.');
    }
  }

  private inicializarFormulario(): void {
    this.formularioFiltro = this.formBuilder.group({
      termino: [''],
      periodo: [''],
      estado: ['']
    });
  }

  cargarVisitas(): void {
    if (!this.unidadId) return;
    this.cargando = true;
    this.visitaService.listarVisitasPorUnidad(this.unidadId).subscribe({
      next: (data) => {
        this.visitasGlobal = data.sort((a, b) => new Date(b.fechaVisitaProgramada).getTime() - new Date(a.fechaVisitaProgramada).getTime());
        this.aplicarFiltrosLocales();
        this.cargando = false;
      },
      error: () => {
        this.toastService.mostrarError('Error al cargar visitas programadas');
        this.cargando = false;
      }
    });
  }

  aplicarFiltrosLocales(): void {
    const filtros = this.formularioFiltro.value;
    let resultados = [...this.visitasGlobal];

    if (filtros.termino && filtros.termino.trim() !== '') {
      const busqueda = filtros.termino.toLowerCase();
      resultados = resultados.filter(v => 
        (v.nombreVisitante && v.nombreVisitante.toLowerCase().includes(busqueda)) ||
        (v.documentoVisitante && v.documentoVisitante.toLowerCase().includes(busqueda))
      );
    }

    if (filtros.periodo) {
      const mesFiltro = filtros.periodo.getMonth();
      const anioFiltro = filtros.periodo.getFullYear();
      resultados = resultados.filter(v => {
        if (!v.fechaVisitaProgramada) return false;
        const fecha = new Date(v.fechaVisitaProgramada);
        return fecha.getUTCMonth() === mesFiltro && fecha.getUTCFullYear() === anioFiltro;
      });
    }

    if (filtros.estado) {
      resultados = resultados.filter(v => v.estado === filtros.estado);
    }

    this.visitas = resultados;
    this.paginaActual = 0;
    this.actualizarPaginacion();
  }

  buscarVisitas(): void {
    this.aplicarFiltrosLocales();
  }

  limpiarFiltros(): void {
    this.formularioFiltro.reset({
      termino: '',
      periodo: '',
      estado: ''
    });
    this.aplicarFiltrosLocales();
  }

  actualizarPaginacion(): void {
    this.totalPaginas = Math.ceil(this.visitas.length / this.tamanoPagina);
    if (this.paginaActual >= this.totalPaginas && this.totalPaginas > 0) {
      this.paginaActual = this.totalPaginas - 1;
    }
    const inicio = this.paginaActual * this.tamanoPagina;
    const fin = inicio + this.tamanoPagina;
    this.visitasPaginadas = this.visitas.slice(inicio, fin);
  }

  cambiarPagina(nuevaPagina: number): void {
    this.paginaActual = nuevaPagina;
    this.actualizarPaginacion();
  }

  formatearEstado(estadoId: string): string {
    const opcion = this.opcionesEstado.find(op => op.id === estadoId);
    return opcion ? opcion.nombre : estadoId;
  }
}
