import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IncidenciasService } from '../../services/incidencias.service';
import { IncidenciaResponse, EstadoIncidencia } from '../../modelos/incidencia-response';
import { RespuestaPaginada } from '../../../../compartido/modelos/respuesta-paginada.interface';
import { PaginacionComponent } from '../../../../compartido/componentes/paginacion/paginacion';
import { HttpErrorResponse } from '@angular/common/http';
import { AutenticacionService } from '../../../../nucleo/servicios/autenticacion.service';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';
import { SelectPersonalizadoComponent } from '../../../../compartido/componentes/select-personalizado/select-personalizado';
import { MenuContextualComponent } from '../../../../compartido/componentes/menu-contextual/menu-contextual';

@Component({
  selector: 'app-lista-incidencias',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PaginacionComponent, SelectPersonalizadoComponent, MenuContextualComponent],
  templateUrl: './lista-incidencias.html',
  styleUrl: './lista-incidencias.scss'
})
export class ListaIncidencias implements OnInit {

  private incidenciasService = inject(IncidenciasService);
  private authService = inject(AutenticacionService);
  private toastService = inject(ToastService);

  listaIncidencias: IncidenciaResponse[] = [];
  estadoFiltro: EstadoIncidencia | '' = '';
  cargando = false;
  esAdministrador = false;
  estados = Object.values(EstadoIncidencia);
  opcionesEstado: any[] = [
    { id: 'REGISTRADO', nombre: 'Registrado' },
    { id: 'EN_REVISION', nombre: 'En Revisión' },
    { id: 'EN_ATENCION', nombre: 'En Atención' },
    { id: 'RESUELTO', nombre: 'Resuelto' }
  ];
  
  opcionesTipo: any[] = [
    { id: 'UNIDAD', nombre: 'Unidad' },
    { id: 'AREA', nombre: 'Área Común' }
  ];
  tipoFiltro: string = '';

  mostrarModalDetalle = false;
  incidenciaSeleccionada: IncidenciaResponse | null = null;
  evidenciasSeleccionadas: string[] = [];

  paginaActual = 0;
  tamanoPagina = 9;
  totalElementos = 0;
  totalPaginas = 0;

  ngOnInit(): void {
    this.esAdministrador = this.authService.obtenerRoles().includes('ROLE_ADMINISTRADOR') || this.authService.obtenerRoles().includes('ADMINISTRADOR');
    this.cargarIncidencias();
  }

  cargarIncidencias(): void {
    this.cargando = true;
    const estado = this.estadoFiltro ? this.estadoFiltro as EstadoIncidencia : undefined;
    
    let unidadIdConsulta: number | undefined;
    if (!this.esAdministrador) {
      const miUnidad = this.authService.obtenerUnidadId();
      unidadIdConsulta = miUnidad ? miUnidad : undefined;
    }

    this.incidenciasService.obtenerListaPorEstado(estado, unidadIdConsulta, this.paginaActual, this.tamanoPagina).subscribe({
      next: (res: RespuestaPaginada<IncidenciaResponse>) => {
        this.listaIncidencias = res.contenido.map(incidencia => ({
          ...incidencia,
          estadoFormateado: this.formatearEstado(incidencia.estado),
          gravedadFormateada: this.formatearGravedad(incidencia.gravedad),
          causaFormateada: this.formatearCausa(incidencia.causa)
        }));
        
        if (this.tipoFiltro === 'UNIDAD') {
          this.listaIncidencias = this.listaIncidencias.filter(i => i.unidadId);
        } else if (this.tipoFiltro === 'AREA') {
          this.listaIncidencias = this.listaIncidencias.filter(i => i.areaComunId);
        }

        this.totalElementos = res.totalElementos;
        this.totalPaginas = res.totalPaginas;
        this.cargando = false;
      },
      error: (err: HttpErrorResponse) => {
        this.toastService.mostrarError('Error al cargar incidencias');
        this.cargando = false;
      }
    });
  }

  alCambiarFiltro(): void {
    this.paginaActual = 0;
    this.cargarIncidencias();
  }

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 0 && nuevaPagina < this.totalPaginas) {
      this.paginaActual = nuevaPagina;
      this.cargarIncidencias();
    }
  }

  cerrarModalFondo(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.cerrarModal();
      this.cerrarModalEstado();
    }
  }

  verDetalles(id: number): void {
    this.incidenciaSeleccionada = this.listaIncidencias.find(i => i.id === id) || null;
    this.evidenciasSeleccionadas = [];
    if (this.incidenciaSeleccionada) {
      this.incidenciasService.obtenerEvidencias(id).subscribe({
        next: (evs: string[]) => {
          this.evidenciasSeleccionadas = evs;
        }
      });
    }
    this.mostrarModalDetalle = true;
  }

  cerrarModal(): void {
    this.mostrarModalDetalle = false;
    this.incidenciaSeleccionada = null;
    this.evidenciasSeleccionadas = [];
  }

  abrirImagen(url: string): void {
    window.open(url, '_blank');
  }

  mostrarModalEstado = false;
  responsableModal = '';

  esDanioProvocado(): boolean {
    if (!this.incidenciaSeleccionada) return false;
    return this.incidenciaSeleccionada.causa === 'MAL_USO' || this.incidenciaSeleccionada.causa === 'VANDALISMO';
  }

  abrirModalEstado(id: number): void {
    this.incidenciaSeleccionada = this.listaIncidencias.find(i => i.id === id) || null;
    if (this.incidenciaSeleccionada) {
      const responsable = this.incidenciaSeleccionada.responsableAtencion;
      this.responsableModal = (responsable && responsable !== 'Sin asignar') ? responsable : '';
      this.mostrarModalEstado = true;
    }
  }

  cerrarModalEstado(): void {
    this.mostrarModalEstado = false;
    this.incidenciaSeleccionada = null;
    this.responsableModal = '';
  }

  confirmarCambioEstado(nuevoEstado: string): void {
    if (!this.esAdministrador || !this.incidenciaSeleccionada) return;
    
    this.incidenciasService.actualizarEstado(this.incidenciaSeleccionada.id, { 
      incidenciaId: this.incidenciaSeleccionada.id,
      estado: nuevoEstado,
      responsableAtencion: this.responsableModal
    }).subscribe({
      next: (res: IncidenciaResponse) => {
        this.toastService.mostrarExito('Estado actualizado correctamente');
        this.cerrarModalEstado();
        this.cargarIncidencias();
      },
      error: (err: HttpErrorResponse) => {
        this.toastService.mostrarError('Error al actualizar estado');
      }
    });
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
