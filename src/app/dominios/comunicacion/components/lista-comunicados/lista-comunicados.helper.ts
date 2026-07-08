import { Injectable } from '@angular/core';
import { ComunicadoResponse } from '../../modelos/comunicado.model';
import { FormGroup } from '@angular/forms';

@Injectable()
export class ListaComunicadosState {
  comunicados: ComunicadoResponse[] = [];
  comunicadosFiltrados: ComunicadoResponse[] = [];
  comunicadosPaginados: ComunicadoResponse[] = [];

  paginaActual = 0;
  tamanoPagina = 9;

  setComunicados(comunicados: ComunicadoResponse[]): void {
    this.comunicados = comunicados.sort((a, b) => new Date(b.fechaPublicacion).getTime() - new Date(a.fechaPublicacion).getTime());
  }

  aplicarFiltros(formularioFiltros: FormGroup): void {
    const torre = formularioFiltros.value.torre;
    const unidadId = Number(formularioFiltros.value.unidadId) || null;

    this.comunicadosFiltrados = this.comunicados.filter(c => {
      let coincideTorre = true;
      if (torre) {
        if (c.alcance === 'GLOBAL') {
          coincideTorre = true;
        } else {
          coincideTorre = c.torres?.some(t => t.torre === torre) ?? false;
        }
      }

      let coincideUnidad = true;
      if (unidadId) {
        if (c.alcance === 'GLOBAL') {
          coincideUnidad = true;
        } else if (c.alcance === 'TORRE') {
          coincideUnidad = c.torres?.some(t => t.torre === torre) ?? false;
        } else if (c.alcance === 'UNIDAD') {
          coincideUnidad = c.unidadIds?.includes(unidadId) ?? false;
        }
      }

      return coincideTorre && coincideUnidad;
    });

    this.paginaActual = 0;
    this.actualizarPaginacion(0);
  }

  limpiarFiltrosAdmin(formularioFiltros: FormGroup): void {
    formularioFiltros.reset({ condominioId: '', torre: '', unidadId: '' });
    this.comunicadosFiltrados = [];
    this.comunicadosPaginados = [];
  }

  limpiarFiltrosResidente(perfil: any): void {
    this.aplicarFiltrosResidente(perfil);
  }

  aplicarFiltrosResidente(perfil: any): void {
    if (!perfil) return;
    const torre = perfil.torre;
    const unidadId = perfil.unidadId;

    this.comunicadosFiltrados = this.comunicados.filter(c => {
      if (c.alcance === 'GLOBAL') {
        return true;
      }
      if (c.alcance === 'TORRE') {
        return c.torres?.some(t => t.torre === torre) ?? false;
      }
      if (c.alcance === 'UNIDAD') {
        return c.unidadIds?.includes(unidadId) ?? false;
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
    this.comunicadosPaginados = this.comunicadosFiltrados.slice(inicio, fin);
  }

  obtenerTotalPaginas(): number {
    return Math.ceil(this.comunicadosFiltrados.length / this.tamanoPagina);
  }

  formatearFecha(fechaStr: string): string {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  obtenerTextoAlcance(comunicado: ComunicadoResponse): string {
    if (comunicado.alcance === 'GLOBAL') {
      return `Global (${comunicado.condominioIds?.length || 1} Condominios)`;
    } else if (comunicado.alcance === 'TORRE') {
      return `Torres Específicas (${comunicado.torres?.length || 0} Torres)`;
    } else if (comunicado.alcance === 'UNIDAD') {
      return `Viviendas Específicas (${comunicado.unidadIds?.length || 0} Viviendas)`;
    }
    return 'Desconocido';
  }
}
