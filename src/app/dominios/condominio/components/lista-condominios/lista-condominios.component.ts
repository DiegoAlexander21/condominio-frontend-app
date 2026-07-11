import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CondominioService } from '../../services/condominio.service';
import { CondominioResponse } from '../../modelos/condominio-response.interface';
import { RespuestaPaginada } from '../../../../compartido/modelos/respuesta-paginada.interface';
import { MenuContextualComponent } from '../../../../compartido/componentes/menu-contextual/menu-contextual';
import { PaginacionComponent } from '../../../../compartido/componentes/paginacion/paginacion';
import { ModalConfirmacionComponent } from '../../../../compartido/componentes/modal-confirmacion/modal-confirmacion';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SelectPersonalizadoComponent } from '../../../../compartido/componentes/select-personalizado/select-personalizado';
import { CalendarioPersonalizadoComponent } from '../../../../compartido/componentes/calendario-personalizado/calendario-personalizado';
import { InputBusquedaComponent } from '../../../../compartido/componentes/input-busqueda/input-busqueda';

@Component({
  selector: 'app-lista-condominios',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, MenuContextualComponent, PaginacionComponent, ModalConfirmacionComponent, SelectPersonalizadoComponent, CalendarioPersonalizadoComponent, InputBusquedaComponent],
  templateUrl: './lista-condominios.component.html',
  styleUrls: ['./lista-condominios.component.scss']
})
export class ListaCondominiosComponent implements OnInit {
  private condominioServicio = inject(CondominioService);
  private enrutador = inject(Router);
  private toastServicio = inject(ToastService);
  
  respuestaPaginada$: Observable<RespuestaPaginada<CondominioResponse>> | undefined;
  listaCondominios: CondominioResponse[] = [];
  listaCondominiosGlobal: CondominioResponse[] = [];
  listaCondominiosFiltrados: CondominioResponse[] = [];
  
  cargando = false;
  
  paginaActual = 0;
  tamanoPagina = 9;
  totalPaginas = 1;

  mostrarModalEliminar = false;
  idCondominioAEliminar: number | null = null;

  formularioFiltro: FormGroup;
  listaTorres = [
    { id: '1', nombre: 'Pequeño (1 torre)' },
    { id: '2-5', nombre: 'Mediano (2 a 5 torres)' },
    { id: '6+', nombre: 'Grande (Más de 5 torres)' }
  ];

  constructor(private fb: FormBuilder) {
    this.formularioFiltro = this.fb.group({
      nombre: [''],
      rangoTorres: [''],
      fecha: ['']
    });
  }


  ngOnInit(): void {
    this.obtenerDatos();
  }

  obtenerDatos(): void {
    this.cargando = true;
    this.condominioServicio.obtenerListaCondominios(0, 10000).subscribe({
      next: (data) => {
        this.listaCondominiosGlobal = data.contenido;
        this.cargando = false;
        this.aplicarFiltrosLocales();
      },
      error: () => {
        this.cargando = false;
        this.toastServicio.mostrarError('Error al cargar condominios.');
      }
    });
  }

  buscarCondominios(): void {
    this.paginaActual = 0;
    this.aplicarFiltrosLocales();
  }

  aplicarFiltrosLocales(): void {
    const filtros = this.formularioFiltro.value;
    let resultados = [...this.listaCondominiosGlobal];

    if (filtros.nombre && filtros.nombre.trim() !== '') {
      const termino = filtros.nombre.toLowerCase();
      resultados = resultados.filter(c => c.nombre.toLowerCase().includes(termino));
    }

    if (filtros.rangoTorres) {
      if (filtros.rangoTorres === '1') {
        resultados = resultados.filter(c => c.torres === 1);
      } else if (filtros.rangoTorres === '2-5') {
        resultados = resultados.filter(c => c.torres >= 2 && c.torres <= 5);
      } else if (filtros.rangoTorres === '6+') {
        resultados = resultados.filter(c => c.torres > 5);
      }
    }

    if (filtros.fecha) {
      const fechaBuscada = typeof filtros.fecha === 'string' ? filtros.fecha.split('T')[0] : '';
      resultados = resultados.filter(c => {
        if (!c.fechaRegistro) return false;
        let fechaCondominio = '';
        if (Array.isArray(c.fechaRegistro)) {
          const year = c.fechaRegistro[0];
          const month = c.fechaRegistro[1].toString().padStart(2, '0');
          const day = c.fechaRegistro[2].toString().padStart(2, '0');
          fechaCondominio = `${year}-${month}-${day}`;
        } else if (typeof c.fechaRegistro === 'string') {
          fechaCondominio = c.fechaRegistro.substring(0, 10);
        }
        return fechaCondominio === fechaBuscada;
      });
    }

    this.listaCondominiosFiltrados = resultados;
    this.totalPaginas = Math.ceil(this.listaCondominiosFiltrados.length / this.tamanoPagina) || 1;
    if (this.paginaActual >= this.totalPaginas) {
      this.paginaActual = 0;
    }
    this.actualizarPagina();
  }

  actualizarPagina(): void {
    const inicio = this.paginaActual * this.tamanoPagina;
    const fin = inicio + this.tamanoPagina;
    this.listaCondominios = this.listaCondominiosFiltrados.slice(inicio, fin);
  }

  limpiarFiltros(): void {
    this.formularioFiltro.reset({
      nombre: '',
      rangoTorres: '',
      fecha: ''
    });
    this.buscarCondominios();
  }

  cambiarPagina(nuevaPagina: number): void {
    this.paginaActual = nuevaPagina;
    this.actualizarPagina();
  }

  editarCondominio(id: number): void {
    this.enrutador.navigate(['/condominios/editar', id]);
  }

  eliminarCondominio(id: number): void {
    this.idCondominioAEliminar = id;
    this.mostrarModalEliminar = true;
  }

  cancelarEliminacion(): void {
    this.mostrarModalEliminar = false;
    this.idCondominioAEliminar = null;
  }

  confirmarEliminacion(): void {
    if (this.idCondominioAEliminar !== null) {
      this.condominioServicio.eliminarCondominio(this.idCondominioAEliminar).subscribe({
        next: () => {
          this.toastServicio.mostrarExito('Condominio eliminado exitosamente.');
          this.mostrarModalEliminar = false;
          this.idCondominioAEliminar = null;
          this.obtenerDatos();
        },
        error: (error: unknown) => {
          this.toastServicio.mostrarError('Error al eliminar el condominio.');
          this.mostrarModalEliminar = false;
          this.idCondominioAEliminar = null;
        }
      });
    }
  }
}
