import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MantenimientoService } from '../../services/mantenimiento.service';
import { InsumoResponse } from '../../modelos/insumo.model';
import { PaginacionComponent } from '../../../../compartido/componentes/paginacion/paginacion';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';
import { InputBusquedaComponent } from '../../../../compartido/componentes/input-busqueda/input-busqueda';
import { SelectPersonalizadoComponent } from '../../../../compartido/componentes/select-personalizado/select-personalizado';

@Component({
  selector: 'app-dashboard-mantenimiento',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PaginacionComponent, InputBusquedaComponent, SelectPersonalizadoComponent],
  templateUrl: './dashboard-mantenimiento.html',
  styleUrls: ['./dashboard-mantenimiento.scss']
})
export class DashboardMantenimientoComponent implements OnInit {
  private mantenimientoService = inject(MantenimientoService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  todosLosInsumos: InsumoResponse[] = [];
  insumosFiltrados: InsumoResponse[] = [];
  insumosPaginados: InsumoResponse[] = [];
  
  cargando = false;

  terminoBusqueda = '';
  estadoFiltro = '';
  
  opcionesEstado = [
    { id: '', nombre: 'Todos los estados' },
    { id: 'NORMAL', nombre: 'Stock Normal' },
    { id: 'CRITICO', nombre: 'Stock Crítico' }
  ];

  paginaActual = 0;
  tamanioPagina = 9;

  ngOnInit(): void {
    this.cargarInventario();
  }

  cargarInventario(): void {
    this.cargando = true;
    this.mantenimientoService.listarInsumos().subscribe({
      next: (res) => {
        this.todosLosInsumos = res;
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: () => {
        this.toastService.mostrarError('Error al cargar el inventario');
        this.cargando = false;
      }
    });
  }

  aplicarFiltros(): void {
    let filtrados = [...this.todosLosInsumos];

    if (this.terminoBusqueda.trim()) {
      const termino = this.terminoBusqueda.toLowerCase();
      filtrados = filtrados.filter(i => i.nombre.toLowerCase().includes(termino));
    }

    if (this.estadoFiltro === 'NORMAL') {
      filtrados = filtrados.filter(i => i.stockActual > i.stockMinimo);
    } else if (this.estadoFiltro === 'CRITICO') {
      filtrados = filtrados.filter(i => i.stockActual <= i.stockMinimo);
    }

    this.insumosFiltrados = filtrados;
    this.aplicarPaginacion(0);
  }

  limpiarFiltros(): void {
    this.terminoBusqueda = '';
    this.estadoFiltro = '';
    this.aplicarFiltros();
  }

  get totalPaginas(): number {
    return Math.ceil(this.insumosFiltrados.length / this.tamanioPagina);
  }

  aplicarPaginacion(pagina: number = this.paginaActual): void {
    this.paginaActual = pagina;
    const inicio = pagina * this.tamanioPagina;
    this.insumosPaginados = this.insumosFiltrados.slice(inicio, inicio + this.tamanioPagina);
  }

  irANuevoInsumo(): void {
    this.router.navigate(['/mantenimiento/nuevo-insumo']);
  }

  irANuevaTarea(): void {
    this.router.navigate(['/mantenimiento/nueva-tarea']);
  }
}
