import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PaqueteriaService } from '../../services/paqueteria.service';
import { Paquete } from '../../modelos/paquete.model';
import { EstadoPaquete } from '../../modelos/estado-paquete.enum';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';
import { SelectPersonalizadoComponent } from '../../../../compartido/componentes/select-personalizado/select-personalizado';
import { PaginacionComponent } from '../../../../compartido/componentes/paginacion/paginacion';
import { AutenticacionService } from '../../../../nucleo/servicios/autenticacion.service';

@Component({
  selector: 'app-lista-paquetes-residente',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SelectPersonalizadoComponent,
    PaginacionComponent
  ],
  templateUrl: './lista-paquetes-residente.component.html',
  styleUrls: ['./lista-paquetes-residente.component.scss']
})
export class ListaPaquetesResidenteComponent implements OnInit {
  private paqueteriaService = inject(PaqueteriaService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);
  private authService = inject(AutenticacionService);

  paquetes: Paquete[] = [];
  paquetesFiltrados: Paquete[] = [];
  paquetesPaginados: Paquete[] = [];

  formularioFiltros: FormGroup;
  cargando = false;
  unidadId: number | null = null;

  opcionesEstado = [
    { id: '', nombre: 'Todos los estados' },
    { id: EstadoPaquete.NOTIFICADO, nombre: 'Notificado' },
    { id: EstadoPaquete.ENTREGADO, nombre: 'Entregado a ti' }
  ];

  paginaActual = 0;
  tamanoPagina = 9;
  totalPaginas = 1;

  constructor() {
    this.formularioFiltros = this.fb.group({
      estado: ['']
    });
  }

  ngOnInit(): void {
    this.cargarPaquetes();
  }

  cargarPaquetes(): void {
    this.unidadId = this.authService.obtenerUnidadId();
    if (!this.unidadId) {
      this.cargando = false;
      return;
    }

    this.cargando = true;
    this.paqueteriaService.listarPorUnidad(this.unidadId).subscribe({
      next: (datos) => {
        this.paquetes = datos;
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (err) => {
        this.toastService.mostrarError('Error al cargar tus paquetes');
        this.cargando = false;
        console.error(err);
      }
    });
  }

  buscar(): void {
    this.aplicarFiltros();
  }

  limpiarFiltros(): void {
    this.formularioFiltros.reset({ estado: '' });
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    const { estado } = this.formularioFiltros.value;
    let resultado = [...this.paquetes];

    if (estado) {
      resultado = resultado.filter(p => p.estado === estado);
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

  obtenerClaseEstado(estado: EstadoPaquete): string {
    switch (estado) {
      case EstadoPaquete.RECIBIDO: return 'estado-recibido';
      case EstadoPaquete.NOTIFICADO: return 'estado-notificado';
      case EstadoPaquete.ENTREGADO: return 'estado-entregado';
      default: return '';
    }
  }
}
