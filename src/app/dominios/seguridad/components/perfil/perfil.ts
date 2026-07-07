import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioService } from '../../../../nucleo/servicios/usuario.service';
import { CondominioService } from '../../../condominio/services/condominio.service';
import { UnidadService } from '../../../unidades/services/unidad';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';
import { UsuarioPerfilResponse } from '../../../../nucleo/modelos/usuario-perfil-response.interface';
import { MensajeErrorComponent } from '../../../../compartido/componentes/mensaje-error/mensaje-error';
import { CondominioResponse } from '../../../condominio/modelos/condominio-response.interface';
import { UnidadResponse } from '../../../unidades/modelos/unidad-response.interface';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MensajeErrorComponent],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.scss']
})
export class PerfilComponent implements OnInit {
  private usuarioServicio = inject(UsuarioService);
  private condominioServicio = inject(CondominioService);
  private unidadServicio = inject(UnidadService);
  private toastServicio = inject(ToastService);
  private formBuilder = inject(FormBuilder);

  perfil: UsuarioPerfilResponse | null = null;
  cargando = true;
  
  formularioVinculacion: FormGroup;
  listaCondominios: CondominioResponse[] = [];
  listaUnidades: UnidadResponse[] = [];
  vinculando = false;
  mostrarModal = false;

  constructor() {
    this.formularioVinculacion = this.formBuilder.group({
      condominioId: [null, Validators.required],
      unidadId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarPerfil();

    this.formularioVinculacion.get('condominioId')?.valueChanges.subscribe(condId => {
      this.formularioVinculacion.get('unidadId')?.setValue(null);
      this.listaUnidades = [];
      if (condId) {
        this.cargarUnidades(condId);
      }
    });
  }

  private cargarPerfil(): void {
    this.cargando = true;
    this.usuarioServicio.obtenerMiPerfil().subscribe({
      next: (res) => {
        this.perfil = res;
        this.cargando = false;
        
        if (this.esResidente() && !this.perfil.unidadId) {
          this.cargarCondominios();
        } else if (this.esConserje() && !this.perfil.unidadId) {
          this.formularioVinculacion.get('unidadId')?.clearValidators();
          this.formularioVinculacion.get('unidadId')?.updateValueAndValidity();
          this.cargarCondominios();
        }
      },
      error: () => {
        this.toastServicio.mostrarError('Error al cargar tu perfil');
        this.cargando = false;
      }
    });
  }

  private cargarCondominios(): void {
    this.condominioServicio.obtenerListaCondominios(0, 100).subscribe({
      next: (res: { contenido: CondominioResponse[] }) => this.listaCondominios = res.contenido
    });
  }

  private cargarUnidades(condominioId: number): void {
    this.unidadServicio.obtenerListaUnidades(0, 100).subscribe({
      next: (res: { contenido: UnidadResponse[] }) => {
        this.listaUnidades = res.contenido
          .filter(u => u.condominioId === condominioId)
          .map(u => ({
            ...u,
            nombreMostrar: `Torre ${u.torre} - Depto. ${u.numeroUnidad}`
          }));
      }
    });
  }

  vincularMe(): void {
    if (this.formularioVinculacion.invalid) {
      this.formularioVinculacion.markAllAsTouched();
      return;
    }

    this.vinculando = true;
    const condominioId = this.formularioVinculacion.get('condominioId')?.value;
    const unidadId = this.formularioVinculacion.get('unidadId')?.value;

    if (this.esConserje()) {
      this.usuarioServicio.vincularConserje(condominioId).subscribe({
        next: () => {
          this.toastServicio.mostrarExito('¡Te has vinculado exitosamente al condominio!');
          this.finalizarVinculacion();
        },
        error: (err) => {
          this.manejarErrorVinculacion(err, 'Error al intentar vincularte al condominio');
        }
      });
    } else {
      this.usuarioServicio.vincularUnidad(unidadId).subscribe({
        next: () => {
          this.toastServicio.mostrarExito('¡Te has vinculado exitosamente a tu unidad!');
          this.finalizarVinculacion();
        },
        error: (err) => {
          this.manejarErrorVinculacion(err, 'Error al intentar vincularte a la unidad');
        }
      });
    }
  }

  private finalizarVinculacion(): void {
    this.vinculando = false;
    this.cerrarModalVincular();
    this.cargarPerfil();
  }

  private manejarErrorVinculacion(err: HttpErrorResponse, mensajePorDefecto: string): void {
    const mensaje = err.error?.error || err.error?.message || mensajePorDefecto;
    this.toastServicio.mostrarError(mensaje);
    this.vinculando = false;
  }

  esResidente(): boolean {
    return this.perfil?.rol === 'RESIDENTE';
  }

  esConserje(): boolean {
    return this.perfil?.rol === 'CONSERJERIA' || this.perfil?.rol === 'CONSERJERIA_MANTENIMIENTO';
  }

  abrirModalVincular(): void {
    this.mostrarModal = true;
  }

  cerrarModalVincular(): void {
    this.mostrarModal = false;
    this.formularioVinculacion.reset();
  }
}
