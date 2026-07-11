import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { InputBusquedaComponent } from '../../../../compartido/componentes/input-busqueda/input-busqueda';
import { CalendarioPersonalizadoComponent } from '../../../../compartido/componentes/calendario-personalizado/calendario-personalizado';
import { HistorialService } from '../../services/historial';
import { HistorialTitularidadResponse } from '../../modelos/historial-response';
import { PaginacionComponent } from '../../../../compartido/componentes/paginacion/paginacion';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';

@Component({
  selector: 'app-lista-historial',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PaginacionComponent, InputBusquedaComponent, CalendarioPersonalizadoComponent],
  templateUrl: './lista-historial.html',
  styleUrls: ['./lista-historial.scss']
})
export class ListaHistorialComponent implements OnInit {
  private historialServicio = inject(HistorialService);
  private constructorFormulario = inject(FormBuilder);
  private toastService = inject(ToastService);

  listaHistorial: HistorialTitularidadResponse[] = [];
  listaHistorialGlobal: HistorialTitularidadResponse[] = [];
  listaHistorialFiltrada: HistorialTitularidadResponse[] = [];

  cargando = false;

  paginaActual = 0;
  tamanoPagina = 9;
  totalPaginas = 1;

  formularioFiltro: FormGroup = this.constructorFormulario.group({
    termino: [''],
    fecha: ['']
  });

  ngOnInit(): void {
    this.obtenerDatos();
  }

  obtenerDatos(): void {
    this.cargando = true;
    this.historialServicio.obtenerListaHistorial(0, 10000, '').subscribe({
      next: (data) => {
        this.listaHistorialGlobal = data.contenido.map(h => {
          if (Array.isArray(h.fechaCambio)) {
            const [year, month, day, hour = 0, minute = 0, second = 0] = h.fechaCambio;
            const pad = (n: number) => n.toString().padStart(2, '0');
            h.fechaCambio = `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:${pad(second)}`;
          }
          return h;
        });
        this.cargando = false;
        this.aplicarFiltrosLocales();
      },
      error: (error) => {
        this.toastService.mostrarError('Error al cargar la información del historial.');
        this.cargando = false;
        this.listaHistorialGlobal = [];
        this.aplicarFiltrosLocales();
      }
    });
  }

  buscarHistorial(): void {
    this.paginaActual = 0;
    this.aplicarFiltrosLocales();
  }

  aplicarFiltrosLocales(): void {
    const filtros = this.formularioFiltro.value;
    let resultados = [...this.listaHistorialGlobal];

    if (filtros.termino && filtros.termino.trim() !== '') {
      const termino = filtros.termino.toLowerCase();
      resultados = resultados.filter(h => 
        (h.numeroUnidad && h.numeroUnidad.toLowerCase().includes(termino)) ||
        (h.propietarioAnterior && h.propietarioAnterior.toLowerCase().includes(termino)) ||
        (h.nuevoPropietario && h.nuevoPropietario.toLowerCase().includes(termino))
      );
    }

    if (filtros.fecha) {
      const fechaBuscada = typeof filtros.fecha === 'string' ? filtros.fecha.split('T')[0] : '';
      resultados = resultados.filter(h => {
        if (!h.fechaCambio) return false;
        const fechaHistorial = typeof h.fechaCambio === 'string' ? h.fechaCambio.substring(0, 10) : '';
        return fechaHistorial === fechaBuscada;
      });
    }

    this.listaHistorialFiltrada = resultados;
    this.totalPaginas = Math.ceil(this.listaHistorialFiltrada.length / this.tamanoPagina) || 1;
    if (this.paginaActual >= this.totalPaginas) {
      this.paginaActual = 0;
    }
    this.actualizarPagina();
  }

  actualizarPagina(): void {
    const inicio = this.paginaActual * this.tamanoPagina;
    const fin = inicio + this.tamanoPagina;
    this.listaHistorial = this.listaHistorialFiltrada.slice(inicio, fin);
  }

  limpiarFiltros(): void {
    this.formularioFiltro.reset({
      termino: '',
      fecha: ''
    });
    this.buscarHistorial();
  }

  cambiarPagina(nuevaPagina: number): void {
    this.paginaActual = nuevaPagina;
    this.actualizarPagina();
  }
}
