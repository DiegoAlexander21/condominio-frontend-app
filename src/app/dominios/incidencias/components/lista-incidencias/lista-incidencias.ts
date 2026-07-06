import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { IncidenciasService } from '../../services/incidencias.service';
import { IncidenciaResponse, EstadoIncidencia } from '../../modelos/incidencia-response';
import { RespuestaPaginada } from '../../../../compartido/modelos/respuesta-paginada.interface';
import { PaginacionComponent } from '../../../../compartido/componentes/paginacion/paginacion';
import { HttpErrorResponse } from '@angular/common/http';
import { AutenticacionService } from '../../../../nucleo/servicios/autenticacion.service';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';
import { SelectPersonalizadoComponent } from '../../../../compartido/componentes/select-personalizado/select-personalizado';
import { MenuContextualComponent } from '../../../../compartido/componentes/menu-contextual/menu-contextual';
import { InputBusquedaComponent } from '../../../../compartido/componentes/input-busqueda/input-busqueda';
import { CalendarioPersonalizadoComponent } from '../../../../compartido/componentes/calendario-personalizado/calendario-personalizado';
import { ModalDetalleIncidenciaComponent } from '../modal-detalle-incidencia/modal-detalle-incidencia';
import { ModalEstadoIncidenciaComponent } from '../modal-estado-incidencia/modal-estado-incidencia';

@Component({
  selector: 'app-lista-incidencias',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule, 
    ReactiveFormsModule, 
    PaginacionComponent, 
    SelectPersonalizadoComponent, 
    MenuContextualComponent, 
    InputBusquedaComponent, 
    CalendarioPersonalizadoComponent,
    ModalDetalleIncidenciaComponent,
    ModalEstadoIncidenciaComponent
  ],
  templateUrl: './lista-incidencias.html',
  styleUrl: './lista-incidencias.scss'
})
export class ListaIncidencias implements OnInit {

  private incidenciasService = inject(IncidenciasService);
  private authService = inject(AutenticacionService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  listaIncidencias: IncidenciaResponse[] = [];
  listaIncidenciasGlobal: IncidenciaResponse[] = [];
  listaIncidenciasFiltradas: IncidenciaResponse[] = [];

  cargando = false;
  esAdministrador = false;
  estados = Object.values(EstadoIncidencia);

  opcionesEstado: { id: string, nombre: string }[] = [
    { id: 'REGISTRADO', nombre: 'Registrado' },
    { id: 'EN_REVISION', nombre: 'En Revisión' },
    { id: 'EN_ATENCION', nombre: 'En Atención' },
    { id: 'RESUELTO', nombre: 'Resuelto' }
  ];

  formularioFiltro: FormGroup;

  mostrarModalDetalle = false;
  mostrarModalEstado = false;
  incidenciaSeleccionada: IncidenciaResponse | null = null;

  paginaActual = 0;
  tamanoPagina = 9;
  totalElementos = 0;
  totalPaginas = 0;

  constructor() {
    this.formularioFiltro = this.fb.group({
      termino: [''],
      estado: [''],
      fecha: ['']
    });
  }

  ngOnInit(): void {
    this.esAdministrador = this.authService.obtenerRoles().includes('ROLE_ADMINISTRADOR') || this.authService.obtenerRoles().includes('ADMINISTRADOR');
    this.obtenerDatos();
  }

  obtenerDatos(): void {
    this.cargando = true;
    let unidadIdConsulta: number | undefined;
    if (!this.esAdministrador) {
      const miUnidad = this.authService.obtenerUnidadId();
      unidadIdConsulta = miUnidad ? miUnidad : undefined;
    }

    this.incidenciasService.obtenerListaPorEstado(undefined, unidadIdConsulta, 0, 10000).subscribe({
      next: (res: RespuestaPaginada<IncidenciaResponse>) => {
        this.listaIncidenciasGlobal = res.contenido.map(incidencia => ({
          ...incidencia,
          estadoFormateado: this.formatearEstado(incidencia.estado),
          gravedadFormateada: this.formatearGravedad(incidencia.gravedad),
          causaFormateada: this.formatearCausa(incidencia.causa)
        }));
        this.cargando = false;
        this.aplicarFiltrosLocales();
      },
      error: (err: HttpErrorResponse) => {
        this.toastService.mostrarError('Error al cargar incidencias');
        this.cargando = false;
        this.listaIncidenciasGlobal = [];
        this.aplicarFiltrosLocales();
      }
    });
  }

  buscarIncidencias(): void {
    this.paginaActual = 0;
    this.aplicarFiltrosLocales();
  }

  aplicarFiltrosLocales(): void {
    const filtros = this.formularioFiltro.value;
    let resultados = [...this.listaIncidenciasGlobal];

    if (filtros.termino && filtros.termino.trim() !== '') {
      const termino = filtros.termino.toLowerCase();
      resultados = resultados.filter(i => 
        (i.lugarAfectado && i.lugarAfectado.toLowerCase().includes(termino)) ||
        (i.descripcion && i.descripcion.toLowerCase().includes(termino)) ||
        (i.responsableAtencion && i.responsableAtencion.toLowerCase().includes(termino))
      );
    }

    if (filtros.estado) {
      resultados = resultados.filter(i => i.estado === filtros.estado);
    }

    if (filtros.fecha) {
      const fechaBuscada = typeof filtros.fecha === 'string' ? filtros.fecha.split('T')[0] : '';
      resultados = resultados.filter(i => {
        if (!i.fechaReporte) return false;
        let fechaIncidencia = '';
        if (Array.isArray(i.fechaReporte)) {
          const year = i.fechaReporte[0];
          const month = i.fechaReporte[1].toString().padStart(2, '0');
          const day = i.fechaReporte[2].toString().padStart(2, '0');
          fechaIncidencia = `${year}-${month}-${day}`;
        } else if (typeof i.fechaReporte === 'string') {
          fechaIncidencia = i.fechaReporte.substring(0, 10);
        }
        return fechaIncidencia === fechaBuscada;
      });
    }

    this.listaIncidenciasFiltradas = resultados;
    this.totalPaginas = Math.ceil(this.listaIncidenciasFiltradas.length / this.tamanoPagina) || 1;
    if (this.paginaActual >= this.totalPaginas) {
      this.paginaActual = 0;
    }
    this.actualizarPagina();
  }

  actualizarPagina(): void {
    const inicio = this.paginaActual * this.tamanoPagina;
    const fin = inicio + this.tamanoPagina;
    this.listaIncidencias = this.listaIncidenciasFiltradas.slice(inicio, fin);
  }

  limpiarFiltros(): void {
    this.formularioFiltro.reset({
      termino: '',
      estado: '',
      fecha: ''
    });
    this.buscarIncidencias();
  }

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 0 && nuevaPagina < this.totalPaginas) {
      this.paginaActual = nuevaPagina;
      this.actualizarPagina();
    }
  }

  verDetalles(id: number): void {
    this.incidenciaSeleccionada = this.listaIncidencias.find(i => i.id === id) || null;
    this.mostrarModalDetalle = true;
  }

  cerrarModal(): void {
    this.mostrarModalDetalle = false;
    this.incidenciaSeleccionada = null;
  }

  abrirModalEstado(id: number): void {
    this.incidenciaSeleccionada = this.listaIncidencias.find(i => i.id === id) || null;
    if (this.incidenciaSeleccionada) {
      this.mostrarModalEstado = true;
    }
  }

  cerrarModalEstado(): void {
    this.mostrarModalEstado = false;
    this.incidenciaSeleccionada = null;
  }

  alActualizarEstado(): void {
    this.cerrarModalEstado();
    this.obtenerDatos();
  }

  formatearEstado(estado: string): string {
    const estados: Record<string, string> = {
      'REGISTRADO': 'Registrado',
      'EN_REVISION': 'En Revisión',
      'EN_ATENCION': 'En Atención',
      'RESUELTO': 'Resuelto'
    };
    return estados[estado] || estado;
  }

  private formatearGravedad(gravedad: string): string {
    const gravedades: Record<string, string> = {
      'LEVE': 'Leve',
      'MODERADO': 'Moderado',
      'GRAVE': 'Grave',
      'CRITICO': 'Crítico'
    };
    return gravedades[gravedad] || gravedad;
  }

  private formatearCausa(causa: string): string {
    const causas: Record<string, string> = {
      'DESGASTE': 'Desgaste',
      'MAL_USO': 'Mal Uso',
      'CLIMA': 'Clima',
      'VANDALISMO': 'Vandalismo'
    };
    return causas[causa] || causa;
  }
}
