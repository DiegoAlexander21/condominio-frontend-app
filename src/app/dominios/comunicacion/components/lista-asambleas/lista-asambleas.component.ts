import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PaginacionComponent } from '../../../../compartido/componentes/paginacion/paginacion';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';
import { ComunicacionService } from '../../services/comunicacion.service';
import { UsuarioService } from '../../../../nucleo/servicios/usuario.service';
import { UsuarioPerfilResponse } from '../../../../nucleo/modelos/usuario-perfil-response.interface';
import { CondominioService } from '../../../condominio/services/condominio.service';
import { UnidadService } from '../../../unidades/services/unidad';
import { SelectPersonalizadoComponent } from '../../../../compartido/componentes/select-personalizado/select-personalizado';
import { InputBusquedaComponent } from '../../../../compartido/componentes/input-busqueda/input-busqueda';
import { CalendarioPersonalizadoComponent } from '../../../../compartido/componentes/calendario-personalizado/calendario-personalizado';
import { ListaAsambleasState } from './lista-asambleas.helper';

@Component({
  selector: 'app-lista-asambleas',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    ReactiveFormsModule, 
    PaginacionComponent,
    SelectPersonalizadoComponent,
  ],
  templateUrl: './lista-asambleas.component.html',
  styleUrls: ['./lista-asambleas.component.scss'],
  providers: [ListaAsambleasState]
})
export class ListaAsambleasComponent implements OnInit {
  private comunicacionService = inject(ComunicacionService);
  private usuarioService = inject(UsuarioService);
  private condominioService = inject(CondominioService);
  private unidadService = inject(UnidadService);
  private toastService = inject(ToastService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  public state = inject(ListaAsambleasState);

  formularioFiltros!: FormGroup;
  opcionesCondominios: { id: number | string, nombre: string }[] = [];
  opcionesTorres: { id: number | string, nombre: string }[] = [];
  opcionesUnidades: { id: number | string, nombre: string }[] = [];
  
  cargando = true;
  mostrarResultados = false;
  perfil: UsuarioPerfilResponse | null = null;
  condominioCargado: number | null = null;

  ngOnInit(): void {
    this.formularioFiltros = this.formBuilder.group({
      condominioId: [''],
      torre: [''],
      unidadId: ['']
    });

    this.configurarCambiosEnCascada();
    this.cargarPerfilYAsambleas();
  }

  private configurarCambiosEnCascada(): void {
    this.formularioFiltros.get('condominioId')?.valueChanges.subscribe(condId => {
      this.formularioFiltros.patchValue({ torre: '', unidadId: '' }, { emitEvent: false });
      this.opcionesTorres = [];
      this.opcionesUnidades = [];

      if (condId) {
        this.unidadService.buscarTorresMultiples([Number(condId)]).subscribe({
          next: (torres) => {
            this.opcionesTorres = [
              { id: '', nombre: 'Todas las torres' },
              ...torres.map(t => ({ id: t.torre, nombre: `Torre ${t.torre}` }))
            ];
          },
          error: () => this.toastService.mostrarError('Error al cargar torres')
        });
      }
    });

    this.formularioFiltros.get('torre')?.valueChanges.subscribe(torre => {
      this.formularioFiltros.patchValue({ unidadId: '' }, { emitEvent: false });
      this.opcionesUnidades = [];

      const condId = this.formularioFiltros.get('condominioId')?.value;
      if (torre && condId) {
        this.unidadService.buscarViviendasMultiples([{ condominioId: Number(condId), torre: torre }]).subscribe({
          next: (unidades) => {
            this.opcionesUnidades = [
              { id: '', nombre: 'Todas las viviendas' },
              ...unidades.map(u => ({ id: u.id, nombre: `Vivienda ${u.numeroUnidad}` }))
            ];
          },
          error: () => this.toastService.mostrarError('Error al cargar viviendas')
        });
      }
    });
  }

  private cargarPerfilYAsambleas(): void {
    this.cargando = true;
    this.usuarioService.obtenerMiPerfil().subscribe({
      next: (perfil) => {
        this.perfil = perfil;
        if (this.esAdministrador()) {
          this.cargarCondominios();
          this.cargando = false;
        } else {
          const condId = perfil.condominioId;
          if (condId) {
            this.formularioFiltros.patchValue({ condominioId: condId });
            this.cargarAsambleas(condId, true);
          } else {
            this.cargando = false;
          }
        }
      },
      error: () => {
        this.toastService.mostrarError('Error al cargar el perfil');
        this.cargando = false;
      }
    });
  }

  private cargarCondominios(): void {
    this.condominioService.obtenerListaCondominios(0, 100).subscribe({
      next: (res) => {
        this.opcionesCondominios = [
          { id: '', nombre: 'Seleccione un condominio' },
          ...res.contenido
        ];
      }
    });
  }

  private cargarAsambleas(condominioId: number, aplicarInmediato: boolean = false): void {
    this.cargando = true;
    this.comunicacionService.obtenerAsambleas(condominioId).subscribe({
      next: (asambleas) => {
        this.state.setAsambleas(asambleas);
        this.condominioCargado = condominioId;
        this.cargando = false;
        
        if (aplicarInmediato) {
          if (this.esAdministrador()) {
             this.state.aplicarFiltros(this.formularioFiltros);
          } else {
             this.state.aplicarFiltrosResidente(this.perfil);
          }
          this.mostrarResultados = true;
        }
      },
      error: () => {
        this.toastService.mostrarError('Error al cargar asambleas');
        this.cargando = false;
      }
    });
  }

  buscar(): void {
    const condId = this.formularioFiltros.value.condominioId;
    if (this.esAdministrador() && !condId) {
      this.toastService.mostrarAdvertencia('Debe seleccionar un Condominio para buscar');
      return;
    }

    if (this.condominioCargado !== Number(condId)) {
      this.cargarAsambleas(Number(condId), true);
    } else {
      this.state.aplicarFiltros(this.formularioFiltros);
      this.mostrarResultados = true;
    }
  }

  limpiarFiltros(): void {
    if (this.esAdministrador()) {
      this.state.limpiarFiltrosAdmin(this.formularioFiltros);
      this.mostrarResultados = false;
      this.condominioCargado = null;
    } else {
      this.state.limpiarFiltrosResidente(this.formularioFiltros, this.perfil);
    }
  }

  esAdministrador(): boolean {
    return this.perfil?.rol === 'ADMINISTRADOR';
  }
}
