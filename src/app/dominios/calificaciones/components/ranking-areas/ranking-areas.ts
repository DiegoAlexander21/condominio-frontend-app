import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CalificacionService } from '../../services/calificacion.service';
import { EstadoAreaResponse } from '../../modelos/calificacion.model';
import { PaginacionComponent } from '../../../../compartido/componentes/paginacion/paginacion';
import { SelectPersonalizadoComponent } from '../../../../compartido/componentes/select-personalizado/select-personalizado';
import { MenuContextualComponent } from '../../../../compartido/componentes/menu-contextual/menu-contextual';
import { Router } from '@angular/router';
import { CondominioService } from '../../../condominio/services/condominio.service';
import { CondominioResponse } from '../../../condominio/modelos/condominio-response.interface';
import { CondominioForm } from '../../../condominio/modelos/condominio-form.interface';
import { AreasComunesService } from '../../../areascomunes/services/areas-comunes';
import { UnidadService } from '../../../unidades/services/unidad';
import { AutenticacionService } from '../../../../nucleo/servicios/autenticacion.service';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';
import { AreaComunResponse } from '../../../areascomunes/modelos/area-comun-response';

@Component({
  selector: 'app-ranking-areas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PaginacionComponent, SelectPersonalizadoComponent, MenuContextualComponent],
  templateUrl: './ranking-areas.html',
  styleUrls: ['./ranking-areas.scss']
})
export class RankingAreasComponent implements OnInit {
  private calificacionService = inject(CalificacionService);
  private condominioServicio = inject(CondominioService);
  private areasComunesServicio = inject(AreasComunesService);
  private unidadServicio = inject(UnidadService);
  private authServicio = inject(AutenticacionService);
  private formBuilder = inject(FormBuilder);
  private toastServicio = inject(ToastService);
  private router = inject(Router);

  rankingOriginal: EstadoAreaResponse[] = [];
  rankingFiltrado: EstadoAreaResponse[] = [];
  rankingPaginado: EstadoAreaResponse[] = [];
  
  listaCondominios: CondominioResponse[] = [];
  listaAreas: AreaComunResponse[] = [];

  formularioFiltro: FormGroup;
  esAdmin: boolean = false;
  unidadIdUsuario: number | null = null;
  mostrarResultados = false;

  paginaActual = 1;
  tamanoPagina = 9;

  get totalPaginas(): number {
    return Math.ceil(this.rankingFiltrado.length / this.tamanoPagina);
  }

  constructor() {
    this.formularioFiltro = this.formBuilder.group({
      condominioId: [''],
      areaComunId: ['']
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
      if (condominioId) {
        this.cargarAreas(Number(condominioId));
      }
    });

    this.cargarRanking();
  }

  private cargarCondominios(): void {
    this.condominioServicio.obtenerListaCondominios(0, 100).subscribe({
      next: (res: { contenido: CondominioResponse[] }) => {
        this.listaCondominios = res.contenido;
      }
    });
  }

  private obtenerCondominioDeResidente(unidadId: number): void {
    this.unidadServicio.obtenerUnidad(unidadId).subscribe({
      next: (res: { condominioId: number }) => {
        const condominioId = res.condominioId;
        this.condominioServicio.obtenerCondominio(condominioId).subscribe({
          next: (cond: CondominioForm) => {
            this.listaCondominios = [{
              id: cond.id as number,
              nombre: cond.nombre,
              torres: cond.torres,
              pisosPorTorre: cond.pisosPorTorre,
              fechaRegistro: ''
            }];
            this.formularioFiltro.get('condominioId')?.setValue(cond.id);
            this.formularioFiltro.get('condominioId')?.disable();
          }
        });
      }
    });
  }

  private cargarAreas(condominioId: number): void {
    this.areasComunesServicio.obtenerAreas(condominioId, 0, 100).subscribe({
      next: (res: { contenido: AreaComunResponse[] }) => {
        this.listaAreas = res.contenido;
      }
    });
  }

  cargarRanking(): void {
    this.calificacionService.obtenerRankingAreas().subscribe(datos => {
      this.rankingOriginal = datos;
      if (!this.esAdmin && this.formularioFiltro.getRawValue().condominioId) {
        this.aplicarFiltros();
      }
    });
  }

  buscarRanking(): void {
    if (this.esAdmin) {
      const condominioId = this.formularioFiltro.get('condominioId')?.value;
      if (!condominioId) {
        this.toastServicio.mostrarError('Primero debe seleccionar un Condominio');
        return;
      }
    }
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    const condominioId = this.formularioFiltro.getRawValue().condominioId;
    const areaComunId = this.formularioFiltro.getRawValue().areaComunId;

    this.rankingFiltrado = this.rankingOriginal.filter(r => {
      let cumpleCondominio = true;
      let cumpleArea = true;

      if (condominioId) {
        cumpleCondominio = r.condominioId === Number(condominioId);
      }
      if (areaComunId) {
        cumpleArea = r.areaId === Number(areaComunId);
      }

      return cumpleCondominio && cumpleArea;
    });

    this.mostrarResultados = true;
    this.paginaActual = 1;
    this.actualizarPaginacion();
  }

  limpiarFiltros(): void {
    this.rankingFiltrado = [];
    this.rankingPaginado = [];
    this.mostrarResultados = false;
    this.paginaActual = 1;
    
    this.formularioFiltro.patchValue({
      areaComunId: ''
    });

    if (this.esAdmin) {
      this.formularioFiltro.get('condominioId')?.setValue('');
    }
  }

  alCambiarPagina(nuevaPagina: number): void {
    this.paginaActual = nuevaPagina;
    this.actualizarPaginacion();
  }

  actualizarPaginacion(): void {
    const inicio = (this.paginaActual - 1) * this.tamanoPagina;
    const fin = inicio + this.tamanoPagina;
    this.rankingPaginado = this.rankingFiltrado.slice(inicio, fin);
  }
  
  verDetalle(areaId: number): void {
    this.router.navigate(['/calificaciones/area', areaId]);
  }
  
  calificarArea(areaId: number): void {
    this.router.navigate(['/calificaciones/calificar', areaId]);
  }
}
