import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';
import { ComunicacionService } from '../../services/comunicacion.service';
import { MensajeErrorComponent } from '../../../../compartido/componentes/mensaje-error/mensaje-error';
import { HttpErrorResponse } from '@angular/common/http';
import { AlcanceComunicado } from '../../modelos/alcance-comunicado.enum';
import { FormularioAsambleaState } from './formulario-asamblea.state';
import { TorreDto } from '../../../unidades/modelos/torre.dto';

import { TooltipInformativoComponent } from '../../../../compartido/componentes/tooltip-informativo/tooltip-informativo';

@Component({
  selector: 'app-formulario-asamblea',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MensajeErrorComponent, TooltipInformativoComponent],
  templateUrl: './formulario-asamblea.component.html',
  styleUrls: ['./formulario-asamblea.component.scss'],
  providers: [FormularioAsambleaState]
})
export class FormularioAsambleaComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private comunicacionService = inject(ComunicacionService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  public state = inject(FormularioAsambleaState);

  formulario: FormGroup;
  guardando = false;

  constructor() {
    this.formulario = this.formBuilder.group({
      alcance: [AlcanceComunicado.GLOBAL, [Validators.required]],
      condominioIds: [[], [Validators.required, Validators.minLength(1)]],
      torres: [[]],
      unidadIds: [[]],
      titulo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      descripcion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      opciones: this.formBuilder.array([], Validators.required)
    });
    this.state.vincularFormulario(this.formulario);
  }

  ngOnInit(): void {
    this.state.cargarCondominios();
    this.agregarOpcion();
    this.agregarOpcion();
  }

  get opcionesArray(): FormArray {
    return this.formulario.get('opciones') as FormArray;
  }

  agregarOpcion(): void {
    if (this.opcionesArray.length < 10) {
      this.opcionesArray.push(this.formBuilder.control('', Validators.required));
    } else {
      this.toastService.mostrarAdvertencia('No puedes agregar más de 10 opciones.');
    }
  }

  eliminarOpcion(index: number): void {
    if (this.opcionesArray.length > 2) {
      this.opcionesArray.removeAt(index);
    } else {
      this.toastService.mostrarAdvertencia('Debe haber al menos 2 opciones.');
    }
  }

  get alcanceSeleccionado(): string {
    return this.formulario.get('alcance')?.value;
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.toastService.mostrarAdvertencia('Revisa los campos obligatorios.');
      return;
    }

    const fechaInicio = new Date(this.formulario.value.fechaInicio);
    const fechaFin = new Date(this.formulario.value.fechaFin);

    if (fechaInicio >= fechaFin) {
      this.toastService.mostrarError('La fecha de inicio debe ser menor que la fecha de fin.');
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

    this.guardando = true;
    
    const opcionesLimpias = this.opcionesArray.controls.map(c => c.value);

    const torresReconstruidas: TorreDto[] = torresStr.map(str => {
      const [cid, t] = str.split('_');
      return { condominioId: Number(cid), torre: t };
    });

    this.comunicacionService.registrarAsamblea({
      alcance: alcance,
      condominioIds: this.formulario.value.condominioIds,
      torres: torresReconstruidas,
      unidadIds: unidades,
      titulo: this.formulario.value.titulo,
      descripcion: this.formulario.value.descripcion,
      fechaInicio: this.formulario.value.fechaInicio,
      fechaFin: this.formulario.value.fechaFin,
      opciones: opcionesLimpias
    }).subscribe({
      next: () => {
        this.toastService.mostrarExito('Asamblea programada exitosamente.');
        this.router.navigate(['/comunicacion/asambleas']);
      },
      error: (err: HttpErrorResponse) => {
        const msg = err.error?.error || 'Error al programar asamblea.';
        this.toastService.mostrarError(msg);
        this.guardando = false;
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/comunicacion/asambleas']);
  }
}
