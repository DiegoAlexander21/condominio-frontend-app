import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PaqueteriaService } from '../../services/paqueteria.service';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';
import { MensajeErrorComponent } from '../../../../compartido/componentes/mensaje-error/mensaje-error';
import { UsuarioService } from '../../../../nucleo/servicios/usuario.service';
import { UnidadService } from '../../../unidades/services/unidad';
import { UnidadResponse } from '../../../unidades/modelos/unidad-response.interface';

@Component({
  selector: 'app-formulario-paquete',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MensajeErrorComponent],
  templateUrl: './formulario-paquete.component.html',
  styleUrls: ['./formulario-paquete.component.scss']
})
export class FormularioPaqueteComponent implements OnInit {
  private fb = inject(FormBuilder);
  private paqueteriaService = inject(PaqueteriaService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private usuarioServicio = inject(UsuarioService);

  formulario: FormGroup;
  guardando = false;
  condominioVinculado = true;
  unidades: UnidadResponse[] = [];
  cargandoUnidades = false;

  private unidadService = inject(UnidadService);

  constructor() {
    this.formulario = this.fb.group({
      unidadId: ['', [Validators.required, Validators.min(1)]],
      remitente: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
      destinatario: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
      observacion: ['', [Validators.maxLength(300)]]
    });
  }

  ngOnInit(): void {
    this.usuarioServicio.obtenerMiPerfil().subscribe({
      next: (perfil) => {
        if (!perfil.unidadId) {
          this.condominioVinculado = false;
        } else {
          this.condominioVinculado = true;
          this.cargarUnidades(perfil.unidadId);
        }
      },
      error: () => {
        this.condominioVinculado = false;
      }
    });
  }

  cargarUnidades(condominioId: number): void {
    this.cargandoUnidades = true;
    this.unidadService.obtenerListaUnidades(0, 1000).subscribe({
      next: (res) => {
        this.unidades = res.contenido.filter(u => u.condominioId === condominioId);
        this.cargandoUnidades = false;
      },
      error: () => {
        this.toastService.mostrarError('Error al cargar las unidades del condominio');
        this.cargandoUnidades = false;
      }
    });
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.toastService.mostrarAdvertencia('Revisa los campos del formulario');
      return;
    }

    this.guardando = true;
    const datos = this.formulario.value;

    this.paqueteriaService.registrarRecepcion(datos).subscribe({
      next: () => {
        this.toastService.mostrarExito('Paquete registrado exitosamente');
        this.guardando = false;
        this.router.navigate(['/paqueteria/conserje']);
      },
      error: (err) => {
        this.toastService.mostrarError('Error al registrar el paquete');
        this.guardando = false;
        console.error(err);
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/paqueteria/conserje']);
  }
}
