import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VisitaService } from '../../services/visita.service';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';
import { VisitaResponse, EstadoVisita, RegistroIngresoVisitaForm, RegistroSalidaVisitaForm } from '../../models/visita.model';
import { MenuContextualComponent } from '../../../../compartido/componentes/menu-contextual/menu-contextual';
import { PaginacionComponent } from '../../../../compartido/componentes/paginacion/paginacion';
import { ModalConfirmacionComponent } from '../../../../compartido/componentes/modal-confirmacion/modal-confirmacion';

@Component({
  selector: 'app-visitas-conserje',
  standalone: true,
  imports: [CommonModule, MenuContextualComponent, PaginacionComponent, ModalConfirmacionComponent],
  templateUrl: './visitas-conserje.component.html',
  styleUrls: ['./visitas-conserje.component.scss']
})
export class VisitasConserjeComponent implements OnInit {
  private visitaService = inject(VisitaService);
  private toastService = inject(ToastService);

  pestanaActiva: 'ESPERADAS' | 'EN_EDIFICIO' = 'ESPERADAS';
  visitas: VisitaResponse[] = [];
  paginaActual: number = 0;
  tamanoPagina: number = 10;
  visitasPaginadas: VisitaResponse[] = [];
  totalPaginas: number = 0;
  mostrarModalConfirmacion = false;
  tituloModal = '';
  mensajeModal = '';
  accionPendiente: () => void = () => {};

  ngOnInit(): void {
    this.cargarVisitas();
  }

  cambiarPestana(pestana: 'ESPERADAS' | 'EN_EDIFICIO'): void {
    this.pestanaActiva = pestana;
    this.paginaActual = 0;
    this.cargarVisitas();
  }

  cargarVisitas(): void {
    const estadoABuscar = this.pestanaActiva === 'ESPERADAS' ? EstadoVisita.PRE_REGISTRADA : EstadoVisita.INGRESO_REGISTRADO;
    
    this.visitaService.listarVisitas(estadoABuscar).subscribe({
      next: (data) => {
        this.visitas = data.sort((a, b) => new Date(b.fechaVisitaProgramada).getTime() - new Date(a.fechaVisitaProgramada).getTime());
        this.actualizarPaginacion();
      },
      error: () => this.toastService.mostrarError('Error al cargar la lista de visitas')
    });
  }

  prepararCambioEstado(visitaId: number): void {
    const visita = this.visitas.find(v => v.id === visitaId);
    if (!visita) return;

    if (this.pestanaActiva === 'ESPERADAS') {
      this.confirmarIngreso(visita);
    } else {
      this.confirmarSalida(visita);
    }
  }

  confirmarIngreso(visita: VisitaResponse): void {
    this.tituloModal = 'Registrar Ingreso';
    this.mensajeModal = `¿Está seguro que desea registrar el ingreso de ${visita.nombreVisitante}?`;
    this.accionPendiente = () => {
      const formulario: RegistroIngresoVisitaForm = { visitaId: visita.id };
      this.visitaService.registrarIngreso(formulario).subscribe({
        next: () => {
          this.toastService.mostrarExito('Ingreso registrado con éxito');
          this.cargarVisitas();
        },
        error: (err) => this.toastService.mostrarError(err.error?.error || 'Error al registrar ingreso')
      });
    };
    this.mostrarModalConfirmacion = true;
  }

  confirmarSalida(visita: VisitaResponse): void {
    this.tituloModal = 'Registrar Salida';
    this.mensajeModal = `¿Está seguro que desea registrar la salida de ${visita.nombreVisitante}?`;
    this.accionPendiente = () => {
      const formulario: RegistroSalidaVisitaForm = { visitaId: visita.id };
      this.visitaService.registrarSalida(formulario).subscribe({
        next: () => {
          this.toastService.mostrarExito('Salida registrada con éxito');
          this.cargarVisitas();
        },
        error: (err) => this.toastService.mostrarError(err.error?.error || 'Error al registrar salida')
      });
    };
    this.mostrarModalConfirmacion = true;
  }

  ejecutarAccionConfirmada(): void {
    this.mostrarModalConfirmacion = false;
    this.accionPendiente();
  }

  cancelarAccion(): void {
    this.mostrarModalConfirmacion = false;
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
}
