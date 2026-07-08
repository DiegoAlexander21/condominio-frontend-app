import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SaludAmbientalService } from '../../services/salud-ambiental.service';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';
import { MensajeErrorComponent } from '../../../../compartido/componentes/mensaje-error/mensaje-error';
import { ResultadoChecklist } from '../../modelos/evaluacion.model';

@Component({
  selector: 'app-evaluacion-checklist',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MensajeErrorComponent],
  templateUrl: './evaluacion-checklist.html',
  styleUrls: ['./evaluacion-checklist.scss']
})
export class EvaluacionChecklistComponent implements OnInit {
  private fb = inject(FormBuilder);
  private saludService = inject(SaludAmbientalService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  formulario: FormGroup;
  checklistId!: number;
  guardando = false;
  tituloFormulario = 'Evaluar Checklist';

  resultadosPosibles = [
    { valor: ResultadoChecklist.PASA, etiqueta: 'Apto (Pasa)' },
    { valor: ResultadoChecklist.NO_PASA, etiqueta: 'No Apto (No Pasa)' }
  ];

  constructor() {
    this.formulario = this.fb.group({
      resultado: ['', Validators.required],
      observacion: ['', [Validators.required, Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.checklistId = Number(idParam);
      const checklistNombre = this.route.snapshot.queryParamMap.get('checklistNombre');
      const areaNombre = this.route.snapshot.queryParamMap.get('areaNombre');
      
      if (checklistNombre && areaNombre) {
        this.tituloFormulario = `Evaluar Checklist (${areaNombre} - ${checklistNombre})`;
      }
    } else {
      this.toastService.mostrarError('ID de checklist no válido');
      this.volver();
    }
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.toastService.mostrarAdvertencia('Por favor complete los campos correctamente.');
      return;
    }

    this.guardando = true;
    const datos = {
      checklistId: this.checklistId,
      ...this.formulario.value
    };

    this.saludService.evaluarChecklist(datos).subscribe({
      next: () => {
        this.toastService.mostrarExito('Evaluación registrada correctamente');
        this.volver();
      },
      error: () => {
        this.toastService.mostrarError('Ocurrió un error al registrar la evaluación');
        this.guardando = false;
      }
    });
  }

  volver(): void {
    this.router.navigate(['/salud-ambiental']);
  }
}
