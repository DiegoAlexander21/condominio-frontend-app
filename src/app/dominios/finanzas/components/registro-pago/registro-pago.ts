import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FinanzasService } from '../../services/finanzas.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-registro-pago',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registro-pago.html',
  styleUrl: './registro-pago.scss'
})
export class RegistroPagoComponent implements OnInit {
  formulario: FormGroup;
  cargando = false;
  error: string | null = null;
  saldoPendiente: number = 0;

  constructor(
    private fb: FormBuilder,
    private finanzasService: FinanzasService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.formulario = this.fb.group({
      unidadId: [null, [Validators.required]],
      estadoCuentaId: [null],
      monto: [0, [Validators.required, Validators.min(0.01)]],
      observacion: [''],
      evidenciaUrl: ['']
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const unidadId = params['unidadId'];
      const estadoCuentaId = params['estadoCuentaId'];
      const saldo = params['saldo'];

      if (unidadId) this.formulario.patchValue({ unidadId: +unidadId });
      if (estadoCuentaId) this.formulario.patchValue({ estadoCuentaId: +estadoCuentaId });
      if (saldo) {
        this.saldoPendiente = +saldo;
        this.formulario.patchValue({ monto: this.saldoPendiente });
      }
    });
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    if (this.formulario.value.monto > this.saldoPendiente && this.formulario.value.estadoCuentaId) {
      this.error = `El monto no puede ser mayor al saldo pendiente (S/ ${this.saldoPendiente})`;
      return;
    }
    
    this.cargando = true;
    this.error = null;
    
    this.finanzasService.registrarPago(this.formulario.value).subscribe({
      next: () => {
        this.cargando = false;
        this.router.navigate(['/finanzas/estados-cuenta']);
      },
      error: (err) => {
        this.error = err.error?.error || 'Ocurrió un error al registrar el pago';
        this.cargando = false;
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/finanzas/estados-cuenta']);
  }
}
