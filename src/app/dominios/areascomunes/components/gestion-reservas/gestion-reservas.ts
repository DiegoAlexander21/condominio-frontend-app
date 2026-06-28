import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AreasComunesService } from '../../services/areas-comunes';
import { CondominioService } from '../../../condominio/services/condominio.service';
import { UnidadService } from '../../../unidades/services/unidad';
import { AutenticacionService } from '../../../../nucleo/servicios/autenticacion.service';
import { AreaComunResponse } from '../../modelos/area-comun-response';
import { CondominioResponse } from '../../../condominio/modelos/condominio-response.interface';
import { ReservaAreaComunResponse } from '../../modelos/reserva-area-comun-response.interface';
import { RouterModule } from '@angular/router';
import { ModalConfirmacionComponent } from '../../../../compartido/componentes/modal-confirmacion/modal-confirmacion';
import { MenuContextualComponent } from '../../../../compartido/componentes/menu-contextual/menu-contextual';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';
import { SelectPersonalizadoComponent } from '../../../../compartido/componentes/select-personalizado/select-personalizado';
import { CalendarioPersonalizadoComponent } from '../../../../compartido/componentes/calendario-personalizado/calendario-personalizado';
import { PaginacionComponent } from '../../../../compartido/componentes/paginacion/paginacion';

@Component({
  selector: 'app-gestion-reservas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ModalConfirmacionComponent, MenuContextualComponent, SelectPersonalizadoComponent, CalendarioPersonalizadoComponent, PaginacionComponent],
  templateUrl: './gestion-reservas.html',
  styleUrls: ['./gestion-reservas.scss']
})
export class GestionReservasComponent implements OnInit {
  private areasComunesServicio = inject(AreasComunesService);
  private condominioServicio = inject(CondominioService);
  private unidadServicio = inject(UnidadService);
  private authServicio = inject(AutenticacionService);
  private formBuilder = inject(FormBuilder);
  private toastServicio = inject(ToastService);

  listaCondominios: any[] = [];
  listaAreas: AreaComunResponse[] = [];
  listaReservas: ReservaAreaComunResponse[] = [];

  paginaActualReservas = 0;
  totalPaginasReservas = 0;

  formularioFiltro: FormGroup;
  esAdmin: boolean = false;
  unidadIdUsuario: number | null = null;
  cargando = false;

  mostrarModalEliminar = false;
  idReservaAEliminar: number | null = null;
  mostrarResultados = false;

  constructor() {
    this.formularioFiltro = this.formBuilder.group({
      condominioId: [''],
      areaComunId: [''],
      fecha: ['']
    });
  }

  ngOnInit(): void {
    const roles = this.authServicio.obtenerRoles();
    this.esAdmin = roles.includes('ADMINISTRADOR');
    this.unidadIdUsuario = this.authServicio.obtenerUnidadId();

    if (this.esAdmin) {
      this.cargarCondominios();
    } else if (this.unidadIdUsuario) {
      this.obtenerCondominioDeResidente(this.unidadIdUsuario);
    }

    this.formularioFiltro.get('condominioId')?.valueChanges.subscribe(condominioId => {
      this.formularioFiltro.get('areaComunId')?.setValue('');
      this.listaAreas = [];
      this.listaReservas = [];
      if (condominioId) {
        this.cargarAreas(Number(condominioId));
      }
    });


  }

  private obtenerFechaActual(): string {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0];
  }

  private cargarCondominios(): void {
    this.condominioServicio.obtenerListaCondominios(0, 100).subscribe({
      next: (res: any) => {
        this.listaCondominios = res.contenido;
      }
    });
  }

  private obtenerCondominioDeResidente(unidadId: number): void {
    this.unidadServicio.obtenerUnidad(unidadId).subscribe({
      next: (res: any) => {
        const condominioId = res.condominioId;
        this.condominioServicio.obtenerCondominio(condominioId).subscribe({
          next: (cond: any) => {
            this.listaCondominios = [{ id: cond.id, nombre: cond.nombre } as any];
            this.formularioFiltro.get('condominioId')?.setValue(cond.id);
            this.formularioFiltro.get('condominioId')?.disable();
          }
        });
      }
    });
  }

  private cargarAreas(condominioId: number): void {
    this.areasComunesServicio.obtenerAreas(condominioId, 0, 100).subscribe({
      next: (res: any) => {
        this.listaAreas = res.contenido;
      }
    });
  }

  buscarReservas(): void {
    this.paginaActualReservas = 0;
    
    if (this.esAdmin) {
      const condominioId = this.formularioFiltro.get('condominioId')?.value;
      if (!condominioId) {
        this.toastServicio.mostrarError('Primero debe seleccionar un Condominio');
        return;
      }
    }

    if (!this.formularioFiltro.get('areaComunId')?.value) {
      this.toastServicio.mostrarError('Seleccione un Área Común para buscar');
      return;
    }
    
    this.cargarReservas();
  }

  cargarReservas(): void {
    const areaComunId = this.formularioFiltro.getRawValue().areaComunId;
    const fecha = this.formularioFiltro.get('fecha')?.value;

    if (areaComunId) {
      this.cargando = true;
      const unidadIdParaFiltro = this.esAdmin ? undefined : (this.unidadIdUsuario || undefined);
      this.areasComunesServicio.obtenerReservas(Number(areaComunId), fecha || undefined, unidadIdParaFiltro, this.paginaActualReservas)
        .subscribe({
          next: (res: any) => {
            this.listaReservas = res.contenido;
            this.totalPaginasReservas = res.totalPaginas;
            this.cargando = false;
            this.mostrarResultados = true;
          },
          error: () => {
            this.cargando = false;
            this.toastServicio.mostrarError('Error al cargar las reservas');
          }
        });
    } else {
      this.listaReservas = [];
      this.totalPaginasReservas = 0;
    }
  }

  limpiarFiltros(): void {
    this.listaReservas = [];
    this.paginaActualReservas = 0;
    this.mostrarResultados = false;
    
    this.formularioFiltro.patchValue({
      areaComunId: '',
      fecha: ''
    });

    if (this.esAdmin) {
      this.formularioFiltro.get('condominioId')?.setValue('');
    }
  }

  cambiarPagina(direccion: number): void {
    const nuevaPagina = this.paginaActualReservas + direccion;
    if (nuevaPagina >= 0 && nuevaPagina < this.totalPaginasReservas) {
      this.paginaActualReservas = nuevaPagina;
      this.cargarReservas();
    }
  }



  puedeCancelar(reserva: ReservaAreaComunResponse): boolean {
    if (reserva.estado === 'CANCELADA') return false;
    if (this.esAdmin) return true;
    return this.unidadIdUsuario === reserva.unidadId;
  }

  eliminarReserva(id: number): void {
    this.idReservaAEliminar = id;
    this.mostrarModalEliminar = true;
  }

  cancelarEliminacion(): void {
    this.mostrarModalEliminar = false;
    this.idReservaAEliminar = null;
  }

  confirmarEliminacion(): void {
    if (this.idReservaAEliminar !== null) {
      this.areasComunesServicio.cancelarReserva(this.idReservaAEliminar).subscribe({
        next: () => {
          this.toastServicio.mostrarExito('Reserva cancelada exitosamente.');
          this.mostrarModalEliminar = false;
          this.idReservaAEliminar = null;
          this.cargarReservas();
        },
        error: () => {
          this.toastServicio.mostrarError('Error al cancelar la reserva.');
          this.mostrarModalEliminar = false;
          this.idReservaAEliminar = null;
        }
      });
    }
  }
}
