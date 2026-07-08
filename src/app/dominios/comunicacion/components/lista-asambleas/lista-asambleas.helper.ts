import { Injectable, inject } from '@angular/core';
import { AsambleaResponse } from '../../modelos/asamblea.model';
import { EstadoAsamblea } from '../../modelos/estado-asamblea.enum';
import { FormGroup } from '@angular/forms';

@Injectable()
export class ListaAsambleasState {
  asambleas: AsambleaResponse[] = [];
  asambleasFiltradas: AsambleaResponse[] = [];
  asambleasPaginadas: AsambleaResponse[] = [];

  paginaActual = 0; 
  tamanoPagina = 9;

  setAsambleas(asambleas: AsambleaResponse[]): void {
    this.asambleas = asambleas.sort((a, b) => {
      if (a.estado === EstadoAsamblea.ABIERTA && b.estado !== EstadoAsamblea.ABIERTA) return -1;
      if (a.estado !== EstadoAsamblea.ABIERTA && b.estado === EstadoAsamblea.ABIERTA) return 1;
      return new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime();
    });
  }

  aplicarFiltros(formularioFiltros: FormGroup): void {
    const torre = formularioFiltros.value.torre;
    const unidadId = Number(formularioFiltros.value.unidadId) || null;

    this.asambleasFiltradas = this.asambleas.filter(a => {
      let coincideTorre = true;
      if (torre) {
        if (a.alcance === 'GLOBAL') {
          coincideTorre = true;
        } else {
          coincideTorre = a.torres?.some(t => t.torre === torre) ?? false;
        }
      }

      let coincideUnidad = true;
      if (unidadId) {
        if (a.alcance === 'GLOBAL') {
          coincideUnidad = true;
        } else if (a.alcance === 'TORRE') {
          coincideUnidad = a.torres?.some(t => t.torre === torre) ?? false;
        } else if (a.alcance === 'UNIDAD') {
          coincideUnidad = a.unidadIds?.includes(unidadId) ?? false;
        }
      }

      return coincideTorre && coincideUnidad;
    });

    this.paginaActual = 0;
    this.actualizarPaginacion(0);
  }

  limpiarFiltrosAdmin(formularioFiltros: FormGroup): void {
    formularioFiltros.reset({ condominioId: '', torre: '', unidadId: '' });
    this.asambleasFiltradas = [];
    this.asambleasPaginadas = [];
  }

  limpiarFiltrosResidente(formularioFiltros: FormGroup, perfil: any): void {
    this.aplicarFiltrosResidente(perfil);
  }

  aplicarFiltrosResidente(perfil: any): void {
    if (!perfil) return;
    const torre = perfil.torre;
    const unidadId = perfil.unidadId;

    this.asambleasFiltradas = this.asambleas.filter(a => {
      if (a.alcance === 'GLOBAL') {
        return true;
      }
      if (a.alcance === 'TORRE') {
        return a.torres?.some(t => t.torre === torre) ?? false;
      }
      if (a.alcance === 'UNIDAD') {
        return a.unidadIds?.includes(unidadId) ?? false;
      }
      return false;
    });

    this.paginaActual = 0;
    this.actualizarPaginacion(0);
  }

  actualizarPaginacion(pagina: number): void {
    this.paginaActual = pagina;
    const inicio = pagina * this.tamanoPagina;
    const fin = inicio + this.tamanoPagina;
    this.asambleasPaginadas = this.asambleasFiltradas.slice(inicio, fin);
  }

  obtenerTotalPaginas(): number {
    return Math.ceil(this.asambleasFiltradas.length / this.tamanoPagina);
  }

  formatearFecha(fechaStr: string): string {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
