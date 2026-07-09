import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CalificacionService } from '../../services/calificacion.service';
import { CalificacionResponse, EstadoAreaResponse } from '../../modelos/calificacion.model';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';
import { PaginacionComponent } from '../../../../compartido/componentes/paginacion/paginacion';

@Component({
  selector: 'app-detalle-estado',
  standalone: true,
  imports: [CommonModule, PaginacionComponent],
  templateUrl: './detalle-estado.html',
  styleUrls: ['./detalle-estado.scss']
})
export class DetalleEstadoComponent implements OnInit {
  areaId: number = 0;
  estadoActual: EstadoAreaResponse | null = null;
  calificaciones: CalificacionResponse[] = [];
  
  calificacionesPaginadas: CalificacionResponse[] = [];
  paginaActual = 1;
  tamanoPagina = 5;

  get totalPaginas(): number {
    return Math.ceil(this.calificaciones.length / this.tamanoPagina);
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private calificacionService: CalificacionService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.areaId = +id;
      this.cargarDetalle();
    }
  }

  cargarDetalle(): void {
    this.calificacionService.obtenerCalificacionesPorArea(this.areaId).subscribe({
      next: (res) => {
        this.estadoActual = res.estadoActual;
        this.calificaciones = res.calificaciones;
        this.paginaActual = 1;
        this.actualizarPaginacion();
      },
      error: () => this.toastService.mostrarError('Error al cargar historial')
    });
  }

  alCambiarPagina(nuevaPagina: number): void {
    this.paginaActual = nuevaPagina;
    this.actualizarPaginacion();
  }

  actualizarPaginacion(): void {
    const inicio = (this.paginaActual - 1) * this.tamanoPagina;
    const fin = inicio + this.tamanoPagina;
    this.calificacionesPaginadas = this.calificaciones.slice(inicio, fin);
  }

  volver(): void {
    this.router.navigate(['/calificaciones']);
  }
}
