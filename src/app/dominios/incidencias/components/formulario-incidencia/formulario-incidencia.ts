import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { IncidenciasService } from '../../services/incidencias.service';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';
import { AutenticacionService } from '../../../../nucleo/servicios/autenticacion.service';
import { CondominioService } from '../../../condominio/services/condominio.service';
import { AreasComunesService } from '../../../areascomunes/services/areas-comunes';
import { UnidadService } from '../../../unidades/services/unidad';
import { CausaIncidencia, GravedadIncidencia } from '../../modelos/incidencia-response';
import { CondominioResponse } from '../../../condominio/modelos/condominio-response.interface';
import { AreaComunResponse } from '../../../areascomunes/modelos/area-comun-response';
import { UnidadResponse } from '../../../unidades/modelos/unidad-response.interface';
import { UnidadForm } from '../../../unidades/modelos/unidad-form.interface';
import { RespuestaPaginada } from '../../../../compartido/modelos/respuesta-paginada.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-formulario-incidencia',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './formulario-incidencia.html',
  styleUrl: './formulario-incidencia.scss'
})
export class FormularioIncidencia implements OnInit {

  private formBuilder = inject(FormBuilder);
  private incidenciasService = inject(IncidenciasService);
  private toastService = inject(ToastService);
  private authService = inject(AutenticacionService);
  private router = inject(Router);

  private condominioService = inject(CondominioService);
  private areasComunesService = inject(AreasComunesService);
  private unidadService = inject(UnidadService);

  formularioIncidencia!: FormGroup;
  
  causas = Object.values(CausaIncidencia);
  gravedades = Object.values(GravedadIncidencia);
  
  listaCondominios: CondominioResponse[] = [];
  listaAreasComunes: AreaComunResponse[] = [];
  listaUnidades: UnidadResponse[] = [];

  imagenesPrevias: string[] = [];
  archivosSeleccionados: File[] = [];

  esAdministrador = false;
  unidadIdUsuario: number | null = null;
  tipoIncidencia: 'AREA' | 'UNIDAD' = 'AREA';
  enviando = false;

  ngOnInit(): void {
    const roles = this.authService.obtenerRoles();
    this.esAdministrador = roles.includes('ADMINISTRADOR') || roles.includes('ROLE_ADMINISTRADOR');
    this.unidadIdUsuario = this.authService.obtenerUnidadId();

    this.formularioIncidencia = this.formBuilder.group({
      condominioId: [null, Validators.required],
      tipoIncidencia: ['AREA', Validators.required],
      areaComunId: [null],
      unidadId: [null],
      descripcion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
      gravedad: [null, Validators.required],
      causa: [null, Validators.required],
      evidenciaUrl: ['']
    });

    this.cargarCondominios();

    this.formularioIncidencia.get('tipoIncidencia')?.valueChanges.subscribe((tipo: 'AREA' | 'UNIDAD') => {
      this.tipoIncidencia = tipo;
      this.actualizarValidacionesPorTipo();
    });

    this.formularioIncidencia.get('condominioId')?.valueChanges.subscribe((condominioId: number | null) => {
      if (condominioId) {
        this.cargarAreas(condominioId);
        if (this.esAdministrador) {
          this.cargarUnidades(); 
        }
      } else {
        this.listaAreasComunes = [];
        this.listaUnidades = [];
      }
    });

    if (!this.esAdministrador && this.unidadIdUsuario) {
      this.unidadService.obtenerUnidad(this.unidadIdUsuario).subscribe({
        next: (unidad: UnidadForm) => {
          this.formularioIncidencia.patchValue({
            condominioId: unidad.condominioId,
            unidadId: this.unidadIdUsuario
          });
          this.actualizarValidacionesPorTipo();
        }
      });
    }

    this.actualizarValidacionesPorTipo();
  }

  actualizarValidacionesPorTipo() {
    const areaCtrl = this.formularioIncidencia.get('areaComunId');
    const unidadCtrl = this.formularioIncidencia.get('unidadId');

    if (this.tipoIncidencia === 'AREA') {
      areaCtrl?.setValidators([Validators.required]);
      unidadCtrl?.clearValidators();
      unidadCtrl?.setValue(null);
    } else {
      areaCtrl?.clearValidators();
      areaCtrl?.setValue(null);
      if (this.esAdministrador) {
        unidadCtrl?.setValidators([Validators.required]);
      } else {
        unidadCtrl?.clearValidators();
        unidadCtrl?.setValue(this.unidadIdUsuario);
      }
    }
    
    areaCtrl?.updateValueAndValidity();
    unidadCtrl?.updateValueAndValidity();
  }

  alSeleccionarArchivo(evento: any): void {
    const archivos: FileList = evento.target.files;
    if (!archivos || archivos.length === 0) return;

    for (let i = 0; i < archivos.length; i++) {
      const archivo = archivos[i];
      
      if (this.archivosSeleccionados.length >= 3) {
        this.toastService.mostrarError('Solo se permiten hasta 3 imágenes.');
        break;
      }

      if (archivo.size > 5 * 1024 * 1024) {
        this.toastService.mostrarError(`El archivo ${archivo.name} supera los 5 MB.`);
        continue;
      }

      this.archivosSeleccionados.push(archivo);
      const lector = new FileReader();
      lector.onload = () => {
        this.imagenesPrevias.push(lector.result as string);
      };
      lector.readAsDataURL(archivo);
    }
    
    evento.target.value = '';
  }

  eliminarFoto(index: number): void {
    this.imagenesPrevias.splice(index, 1);
    this.archivosSeleccionados.splice(index, 1);
  }

  abrirImagen(url: string): void {
    if (url.startsWith('data:')) {
      const partes = url.split(',');
      const mime = partes[0].match(/:(.*?);/)?.[1];
      const dataStr = atob(partes[1]);
      let n = dataStr.length;
      const arr = new Uint8Array(n);
      while (n--) {
        arr[n] = dataStr.charCodeAt(n);
      }
      const blob = new Blob([arr], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    } else {
      window.open(url, '_blank');
    }
  }

  formatearTexto(texto: string): string {
    if (!texto) return '';
    return texto.charAt(0) + texto.slice(1).toLowerCase().replace(/_/g, ' ');
  }

  cargarCondominios() {
    this.condominioService.obtenerListaCondominios(0, 100).subscribe({
      next: (res: RespuestaPaginada<CondominioResponse>) => this.listaCondominios = res.contenido
    });
  }

  cargarAreas(condominioId: number) {
    this.areasComunesService.obtenerAreas(condominioId, 0, 100).subscribe({
      next: (res: RespuestaPaginada<AreaComunResponse>) => this.listaAreasComunes = res.contenido
    });
  }

  cargarUnidades() {
    this.unidadService.obtenerListaUnidades(0, 100).subscribe({
      next: (res: RespuestaPaginada<UnidadResponse>) => this.listaUnidades = res.contenido
    });
  }

  guardarIncidencia(): void {
    if (this.formularioIncidencia.invalid) {
      this.formularioIncidencia.markAllAsTouched();
      this.toastService.mostrarError('Complete los campos obligatorios');
      return;
    }

    this.enviando = true;

    const peticionCloudinary$: Observable<string[]> = this.archivosSeleccionados.length > 0
      ? forkJoin(this.archivosSeleccionados.map(archivo => this.incidenciasService.subirImagenCloudinary(archivo)))
          .pipe(
            switchMap((respuestasCloudinary: any[]) => {
              const urls = respuestasCloudinary.map(res => res.secure_url);
              return of(urls);
            })
          )
      : of([]);

    peticionCloudinary$.subscribe({
      next: (urls: string[]) => {
        if (urls.length > 0) {
          this.formularioIncidencia.patchValue({ evidenciaUrl: urls.join(',') });
        }

        const formValue = this.formularioIncidencia.value;
        
        if (!this.esAdministrador && this.unidadIdUsuario) {
          formValue.unidadIdReporta = this.unidadIdUsuario;
        }

        const request = this.tipoIncidencia === 'AREA'
          ? this.incidenciasService.registrarIncidenciaArea(formValue)
          : this.incidenciasService.registrarIncidenciaUnidad(formValue);

        request.subscribe({
          next: () => {
            this.toastService.mostrarExito('Incidencia reportada correctamente');
            this.router.navigate(['/incidencias']);
            this.enviando = false;
          },
          error: (err: HttpErrorResponse) => {
            this.toastService.mostrarError('Ocurrió un error al reportar la incidencia');
            this.enviando = false;
          }
        });
      },
      error: (err: any) => {
        this.toastService.mostrarError('Error al subir las imágenes a Cloudinary');
        this.enviando = false;
      }
    });
  }
}
