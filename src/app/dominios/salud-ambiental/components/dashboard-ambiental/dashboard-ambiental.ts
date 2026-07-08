import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { SaludAmbientalService } from '../../services/salud-ambiental.service';
import { UsuarioService } from '../../../../nucleo/servicios/usuario.service';
import { UsuarioPerfilResponse } from '../../../../nucleo/modelos/usuario-perfil-response.interface';
import { AreaComunResponse } from '../../../areascomunes/modelos/area-comun-response';
import { ChecklistResponse } from '../../modelos/checklist.model';
import { MantenimientoAmbientalResponse } from '../../modelos/mantenimiento-ambiental.model';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';
import { SelectPersonalizadoComponent } from '../../../../compartido/componentes/select-personalizado/select-personalizado';
import { MenuContextualComponent } from '../../../../compartido/componentes/menu-contextual/menu-contextual';
import { PaginacionComponent } from '../../../../compartido/componentes/paginacion/paginacion';
import { InputBusquedaComponent } from '../../../../compartido/componentes/input-busqueda/input-busqueda';
import { Router } from '@angular/router';
import { CondominioService } from '../../../condominio/services/condominio.service';
@Component({
  selector: 'app-dashboard-ambiental',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SelectPersonalizadoComponent,
    PaginacionComponent,
    MenuContextualComponent,
  ],
  templateUrl: './dashboard-ambiental.html',
  styleUrls: ['./dashboard-ambiental.scss']
})
export class DashboardAmbientalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private saludAmbientalService = inject(SaludAmbientalService);
  private usuarioService = inject(UsuarioService);
  private condominioService = inject(CondominioService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  formularioFiltros!: FormGroup;
  
  opcionesCondominios: { id: number | string, nombre: string }[] = [];
  areasComunes: { id: number | string, nombre: string }[] = [];
  
  checklists: ChecklistResponse[] = [];
  checklistsFiltrados: ChecklistResponse[] = [];
  checklistsPaginados: ChecklistResponse[] = [];
  paginaActualChecklist = 0;
  tamanioPagina = 5;

  mantenimientos: MantenimientoAmbientalResponse[] = [];
  mantenimientosFiltrados: MantenimientoAmbientalResponse[] = [];
  mantenimientosPaginados: MantenimientoAmbientalResponse[] = [];
  paginaActualMantenimiento = 0;

  cargando = false;
  esAdmin = false;
  busquedaRealizada = false;
  areaSeleccionadaBusqueda: number | null = null;

  constructor() {
  }

  ngOnInit(): void {
    this.formularioFiltros = this.fb.group({
      condominioId: [''],
      areaComunId: ['']
    });

    this.formularioFiltros.get('condominioId')?.valueChanges.subscribe(condId => {
      this.formularioFiltros.patchValue({ areaComunId: '' }, { emitEvent: false });
      this.areasComunes = [];
      if (condId) {
        this.cargarAreasComunes(Number(condId));
      }
    });

    this.cargando = true;
    this.usuarioService.obtenerMiPerfil().subscribe({
      next: (perfil) => {
        this.esAdmin = perfil.rol === 'ADMINISTRADOR';
        if (this.esAdmin) {
          this.cargarCondominios();
          this.cargando = false;
        } else if (perfil.condominioId) {
          this.formularioFiltros.patchValue({ condominioId: perfil.condominioId });
        } else {
          this.cargando = false;
        }
      },
      error: () => {
        this.toastService.mostrarError('Error al cargar perfil');
        this.cargando = false;
      }
    });
  }

  private cargarCondominios(): void {
    this.condominioService.obtenerListaCondominios(0, 100).subscribe({
      next: (res) => {
        this.opcionesCondominios = [
          { id: '', nombre: 'Seleccione un condominio' },
          ...res.contenido.map(c => ({ id: c.id, nombre: c.nombre }))
        ];
      },
      error: () => this.toastService.mostrarError('Error al cargar condominios')
    });
  }

  private cargarAreasComunes(condominioId: number): void {
    this.saludAmbientalService.obtenerAreasComunesPorCondominio(condominioId).subscribe({
      next: (areas) => {
        this.areasComunes = [
          { id: '', nombre: 'Seleccione un área' },
          ...areas.map(a => ({ id: a.id, nombre: a.nombre }))
        ];
        this.cargando = false;
      },
      error: () => {
        this.toastService.mostrarError('No se pudieron cargar las áreas comunes');
        this.cargando = false;
      }
    });
  }

  buscar(): void {
    if (this.esAdmin && !this.formularioFiltros.value.condominioId) {
      this.toastService.mostrarAdvertencia('Debe seleccionar un condominio para buscar');
      return;
    }

    const areaId = this.formularioFiltros.value.areaComunId;
    if (!areaId) {
      this.toastService.mostrarAdvertencia('Debe seleccionar un área común para buscar');
      return;
    }

    this.areaSeleccionadaBusqueda = Number(areaId);
    this.busquedaRealizada = true;
    this.cargando = true;
    
    this.saludAmbientalService.listarChecklistsPorArea(Number(areaId)).subscribe({
      next: (res) => {
        this.checklists = res;
        this.aplicarFiltrosChecklist();
        this.cargando = false;
      },
      error: () => {
        this.toastService.mostrarError('Error al cargar checklists');
        this.cargando = false;
      }
    });

    this.saludAmbientalService.obtenerHistorialMantenimiento(Number(areaId)).subscribe({
      next: (res) => {
        this.mantenimientos = res;
        this.aplicarFiltrosMantenimiento();
      },
      error: () => this.toastService.mostrarError('Error al cargar mantenimientos')
    });
  }

  limpiarFiltros(): void {
    if (this.esAdmin) {
      this.formularioFiltros.reset({ condominioId: '', areaComunId: '' });
    } else {
      const condId = this.formularioFiltros.value.condominioId;
      this.formularioFiltros.reset({ condominioId: condId, areaComunId: '' });
    }
    
    this.checklistsFiltrados = [];
    this.checklistsPaginados = [];
    this.mantenimientosFiltrados = [];
    this.mantenimientosPaginados = [];
    this.busquedaRealizada = false;
    this.areaSeleccionadaBusqueda = null;
  }

  private aplicarFiltrosChecklist(): void {
    this.checklistsFiltrados = [...this.checklists];
    this.paginaActualChecklist = 0;
    this.actualizarPaginacionChecklist();
  }

  private aplicarFiltrosMantenimiento(): void {
    this.mantenimientosFiltrados = [...this.mantenimientos];
    this.paginaActualMantenimiento = 0;
    this.actualizarPaginacionMantenimiento();
  }

  get totalPaginasChecklist(): number {
    return Math.ceil(this.checklistsFiltrados.length / this.tamanioPagina);
  }

  get totalPaginasMantenimiento(): number {
    return Math.ceil(this.mantenimientosFiltrados.length / this.tamanioPagina);
  }

  actualizarPaginacionChecklist(pagina: number = this.paginaActualChecklist): void {
    this.paginaActualChecklist = pagina;
    const inicio = pagina * this.tamanioPagina;
    this.checklistsPaginados = this.checklistsFiltrados.slice(inicio, inicio + this.tamanioPagina);
  }

  actualizarPaginacionMantenimiento(pagina: number = this.paginaActualMantenimiento): void {
    this.paginaActualMantenimiento = pagina;
    const inicio = pagina * this.tamanioPagina;
    this.mantenimientosPaginados = this.mantenimientosFiltrados.slice(inicio, inicio + this.tamanioPagina);
  }

  irACrearChecklist(): void {
    if (!this.areaSeleccionadaBusqueda) {
      this.toastService.mostrarAdvertencia('Debe buscar y seleccionar un área común primero');
      return;
    }
    const area = this.areasComunes.find(a => String(a.id) === String(this.areaSeleccionadaBusqueda));
    this.router.navigate(['/salud-ambiental/nuevo-checklist'], {
      queryParams: { areaId: this.areaSeleccionadaBusqueda, areaNombre: area?.nombre }
    });
  }

  irAEvaluar(checklistId: number): void {
    const checklist = this.checklists.find(c => c.id === checklistId);
    const area = this.areasComunes.find(a => String(a.id) === String(this.areaSeleccionadaBusqueda));
    this.router.navigate(['/salud-ambiental/evaluar', checklistId], {
      queryParams: {
        checklistNombre: checklist?.nombre,
        areaNombre: area?.nombre
      }
    });
  }

  irARegistrarMantenimiento(): void {
    if (!this.areaSeleccionadaBusqueda) {
      this.toastService.mostrarAdvertencia('Debe buscar y seleccionar un área común primero');
      return;
    }
    const area = this.areasComunes.find(a => String(a.id) === String(this.areaSeleccionadaBusqueda));
    this.router.navigate(['/salud-ambiental/nuevo-mantenimiento'], {
      queryParams: { areaId: this.areaSeleccionadaBusqueda, areaNombre: area?.nombre }
    });
  }
}
