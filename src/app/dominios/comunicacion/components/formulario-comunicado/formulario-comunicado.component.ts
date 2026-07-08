import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';
import { ModalConfirmacionComponent } from '../../../../compartido/componentes/modal-confirmacion/modal-confirmacion';
import { ComunicacionService } from '../../services/comunicacion.service';
import { MensajeErrorComponent } from '../../../../compartido/componentes/mensaje-error/mensaje-error';
import { HttpErrorResponse } from '@angular/common/http';
import { AlcanceComunicado } from '../../modelos/alcance-comunicado.enum';
import { FormularioComunicadoState } from './formulario-comunicado.state';
import { TorreDto } from '../../../unidades/modelos/torre.dto';
import { TooltipInformativoComponent } from '../../../../compartido/componentes/tooltip-informativo/tooltip-informativo';

@Component({
  selector: 'app-formulario-comunicado',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MensajeErrorComponent, ModalConfirmacionComponent, TooltipInformativoComponent],
  templateUrl: './formulario-comunicado.component.html',
  styleUrls: ['./formulario-comunicado.component.scss'],
  providers: [FormularioComunicadoState]
})
export class FormularioComunicadoComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private comunicacionService = inject(ComunicacionService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  public state = inject(FormularioComunicadoState);

  formulario: FormGroup;
  guardando = false;
  generandoIA = false;
  modalVisible = false;

  constructor() {
    this.formulario = this.formBuilder.group({
      alcance: [AlcanceComunicado.GLOBAL, [Validators.required]],
      condominioIds: [[], [Validators.required, Validators.minLength(1)]],
      torres: [[]],
      unidadIds: [[]],
      titulo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      contenido: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(3000)]]
    });
    this.state.vincularFormulario(this.formulario);
  }

  ngOnInit(): void {
    this.state.cargarCondominios();
  }

  get alcanceSeleccionado(): string {
    return this.formulario.get('alcance')?.value;
  }

  mejorarConIA(): void {
    if (this.formulario.get('condominioIds')?.invalid) {
      this.toastService.mostrarAdvertencia('Selecciona al menos un condominio.');
      return;
    }

    const titulo = this.formulario.get('titulo')?.value;
    const borrador = this.formulario.get('contenido')?.value;

    if (!titulo || titulo.length < 3) {
      this.toastService.mostrarAdvertencia('Escribe un título válido antes de usar IA.');
      return;
    }

    if (!borrador || borrador.length < 10) {
      this.toastService.mostrarAdvertencia('Escribe al menos 10 caracteres en el borrador para que la IA tenga contexto.');
      return;
    }

    this.generandoIA = true;
    
    const torresStr: string[] = this.formulario.get('torres')?.value || [];
    const torresReconstruidas: TorreDto[] = torresStr.map(str => {
      const [cid, t] = str.split('_');
      return { condominioId: Number(cid), torre: t };
    });

    this.comunicacionService.generarConIA({
      alcance: this.formulario.value.alcance,
      condominioIds: this.formulario.value.condominioIds,
      torres: torresReconstruidas,
      unidadIds: this.formulario.value.unidadIds,
      titulo: titulo,
      borrador: borrador
    }).subscribe({
      next: (res) => {
        this.formulario.get('contenido')?.setValue(res.contenido);
        this.toastService.mostrarExito('¡Texto mejorado por IA!');
        this.generandoIA = false;
      },
      error: (err: HttpErrorResponse) => {
        const msg = err.error?.error || 'Error al conectar con la IA.';
        this.toastService.mostrarError(msg);
        this.generandoIA = false;
      }
    });
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.toastService.mostrarAdvertencia('Revisa los campos obligatorios.');
      return;
    }

    const alcance = this.formulario.value.alcance;
    const torresStr: string[] = this.formulario.value.torres || [];
    const unidades = this.formulario.value.unidadIds || [];

    if ((alcance === AlcanceComunicado.TORRE || alcance === AlcanceComunicado.UNIDAD) && torresStr.length === 0) {
      this.toastService.mostrarAdvertencia('Debe seleccionar al menos una torre.');
      return;
    }

    if (alcance === AlcanceComunicado.UNIDAD && unidades.length === 0) {
      this.toastService.mostrarAdvertencia('Debe seleccionar al menos una vivienda.');
      return;
    }

    this.modalVisible = true;
  }

  cerrarModal(): void {
    this.modalVisible = false;
  }

  confirmarGuardar(): void {
    this.modalVisible = false;
    
    const alcance = this.formulario.value.alcance;
    const torresStr: string[] = this.formulario.value.torres || [];
    const unidades = this.formulario.value.unidadIds || [];

    const torresReconstruidas: TorreDto[] = torresStr.map(str => {
      const [cid, t] = str.split('_');
      return { condominioId: Number(cid), torre: t };
    });

    this.guardando = true;
    this.comunicacionService.registrarComunicado({
      alcance: alcance,
      condominioIds: this.formulario.value.condominioIds,
      torres: torresReconstruidas,
      unidadIds: unidades,
      titulo: this.formulario.value.titulo,
      contenido: this.formulario.value.contenido
    }).subscribe({
      next: () => {
        this.toastService.mostrarExito('Comunicado publicado exitosamente.');
        this.router.navigate(['/comunicacion/comunicados']);
      },
      error: (err: HttpErrorResponse) => {
        const msg = err.error?.error || 'Error al publicar el comunicado.';
        this.toastService.mostrarError(msg);
        this.guardando = false;
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/comunicacion/comunicados']);
  }
}
