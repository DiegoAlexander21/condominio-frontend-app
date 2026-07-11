import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PaqueteriaService } from '../../services/paqueteria.service';
import { Paquete } from '../../modelos/paquete.model';
import { EstadoPaquete } from '../../modelos/estado-paquete.enum';
import { UsuarioService } from '../../../../nucleo/servicios/usuario.service';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';
import { SelectPersonalizadoComponent } from '../../../../compartido/componentes/select-personalizado/select-personalizado';
import { InputBusquedaComponent } from '../../../../compartido/componentes/input-busqueda/input-busqueda';
import { PaginacionComponent } from '../../../../compartido/componentes/paginacion/paginacion';
import { ModalConfirmacionComponent } from '../../../../compartido/componentes/modal-confirmacion/modal-confirmacion';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-lista-paquetes-conserje',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    SelectPersonalizadoComponent,
    InputBusquedaComponent,
    PaginacionComponent,
    ModalConfirmacionComponent
  ],
  templateUrl: './lista-paquetes-conserje.component.html',
  styleUrls: ['./lista-paquetes-conserje.component.scss']
})
export class ListaPaquetesConserjeComponent implements OnInit {
  private paqueteriaService = inject(PaqueteriaService);
  private usuarioServicio = inject(UsuarioService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  condominioVinculado = true;
  paquetes: Paquete[] = [];
  paquetesFiltrados: Paquete[] = [];
  paquetesPaginados: Paquete[] = [];

  formularioFiltros: FormGroup;
  cargando = false;

  opcionesEstado = [
    { id: '', nombre: 'Todos los estados' },
    { id: EstadoPaquete.NOTIFICADO, nombre: 'Notificado' },
    { id: EstadoPaquete.ENTREGADO, nombre: 'Entregado' }
  ];

  paginaActual = 0;
  tamanoPagina = 9;
  totalPaginas = 1;

  mostrarModalConfirmacion = false;
  paqueteSeleccionadoParaEntrega: Paquete | null = null;
  observacionEntrega = '';

  constructor() {
    this.formularioFiltros = this.fb.group({
      busqueda: [''],
      estado: ['']
    });
  }

  ngOnInit(): void {
    this.cargando = true;
    this.usuarioServicio.obtenerMiPerfil().subscribe({
      next: (perfil) => {
        if (!perfil.unidadId) {
          this.condominioVinculado = false;
          this.cargando = false;
        } else {
          this.condominioVinculado = true;
          this.cargarPaquetes();
        }
      },
      error: () => {
        this.condominioVinculado = false;
        this.cargando = false;
      }
    });
  }

  cargarPaquetes(): void {
    if (!this.condominioVinculado) return;
    this.cargando = true;
    this.paqueteriaService.listarTodos().subscribe({
      next: (datos) => {
        this.paquetes = datos;
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (err: HttpErrorResponse) => {
        this.toastService.mostrarError('Error al cargar la lista de paquetes');
        this.cargando = false;
      }
    });
  }

  buscar(): void {
    this.aplicarFiltros();
  }

  limpiarFiltros(): void {
    this.formularioFiltros.reset({ busqueda: '', estado: '' });
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    const { busqueda, estado } = this.formularioFiltros.value;
    let resultado = [...this.paquetes];

    if (estado) {
      resultado = resultado.filter(p => p.estado === estado);
    }

    if (busqueda) {
      const termino = busqueda.toLowerCase();
      resultado = resultado.filter(p => 
        (p.destinatario && p.destinatario.toLowerCase().includes(termino)) ||
        (p.remitente && p.remitente.toLowerCase().includes(termino)) ||
        (p.unidadId && p.unidadId.toString().includes(termino))
      );
    }

    this.paquetesFiltrados = resultado;
    this.totalPaginas = Math.ceil(this.paquetesFiltrados.length / this.tamanoPagina);
    this.cambiarPagina(0);
  }

  cambiarPagina(pagina: number): void {
    this.paginaActual = pagina;
    const inicio = pagina * this.tamanoPagina;
    const fin = inicio + this.tamanoPagina;
    this.paquetesPaginados = this.paquetesFiltrados.slice(inicio, fin);
  }

  nuevoPaquete(): void {
    this.router.navigate(['/paqueteria/conserje/nuevo']);
  }

  abrirModalEntrega(paquete: Paquete): void {
    this.paqueteSeleccionadoParaEntrega = paquete;
    this.observacionEntrega = '';
    this.mostrarModalConfirmacion = true;
  }

  cancelarEntrega(): void {
    this.mostrarModalConfirmacion = false;
    this.paqueteSeleccionadoParaEntrega = null;
  }

  confirmarEntrega(): void {
    if (!this.paqueteSeleccionadoParaEntrega) return;

    const id = this.paqueteSeleccionadoParaEntrega.id;
    const formulario = {
      paqueteId: id,
      observacion: this.observacionEntrega
    };

    this.paqueteriaService.registrarEntrega(id, formulario).subscribe({
      next: () => {
        this.toastService.mostrarExito('Paquete entregado exitosamente');
        this.mostrarModalConfirmacion = false;
        this.paqueteSeleccionadoParaEntrega = null;
        this.cargarPaquetes();
      },
      error: (err: HttpErrorResponse) => {
        this.toastService.mostrarError('Error al registrar entrega');
      }
    });
  }

  actualizarObservacion(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    this.observacionEntrega = input.value;
  }

  obtenerClaseEstado(estado: EstadoPaquete): string {
    switch (estado) {
      case EstadoPaquete.RECIBIDO: return 'estado-recibido';
      case EstadoPaquete.NOTIFICADO: return 'estado-notificado';
      case EstadoPaquete.ENTREGADO: return 'estado-entregado';
      default: return '';
    }
  }
}
