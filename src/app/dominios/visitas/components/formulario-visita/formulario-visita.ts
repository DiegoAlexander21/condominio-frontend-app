import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AutenticacionService } from '../../../../nucleo/servicios/autenticacion.service';
import { VisitaService } from '../../services/visita.service';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';
import { MensajeErrorComponent } from '../../../../compartido/componentes/mensaje-error/mensaje-error';
import { Router } from '@angular/router';

@Component({
  selector: 'app-formulario-visita',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MensajeErrorComponent],
  templateUrl: './formulario-visita.html'
})
export class FormularioVisitaComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private authService = inject(AutenticacionService);
  private visitaService = inject(VisitaService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  formularioVisita!: FormGroup;
  unidadId: number | null = null;
  enviando = false;

  ngOnInit(): void {
    this.unidadId = this.authService.obtenerUnidadId();
    if (!this.unidadId) {
      this.toastService.mostrarError('No se detectó una unidad asociada al usuario.');
      this.cancelar();
      return;
    }
    this.inicializarFormulario();
  }

  private inicializarFormulario(): void {
    this.formularioVisita = this.formBuilder.group({
      nombreVisitante: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
      documentoVisitante: ['', [
        Validators.required, 
        Validators.minLength(8), 
        Validators.maxLength(15), 
        Validators.pattern('^[a-zA-Z0-9]+$')
      ]],
      fechaVisitaProgramada: ['', [Validators.required]]
    });
  }

  preRegistrar(): void {
    if (this.formularioVisita.invalid) {
      this.toastService.mostrarError('Verifique los campos requeridos');
      this.formularioVisita.markAllAsTouched();
      return;
    }

    if (!this.unidadId) {
      this.toastService.mostrarError('No tiene unidad asignada');
      return;
    }

    this.enviando = true;
    const formulario = {
      ...this.formularioVisita.value,
      unidadId: this.unidadId
    };

    this.visitaService.registrarVisita(formulario).subscribe({
      next: () => {
        this.toastService.mostrarExito('Visita programada con éxito');
        this.enviando = false;
        this.router.navigate(['/visitas/residente']);
      },
      error: (err) => {
        this.toastService.mostrarError(err.error?.error || 'Error al programar visita');
        this.enviando = false;
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/visitas/residente']);
  }
}
