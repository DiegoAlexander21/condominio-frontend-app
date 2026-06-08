import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MensajeErrorComponent } from '../../../../compartido/componentes/mensaje-error/mensaje-error';
import { CondominioService } from '../../services/condominio.service';

@Component({
  selector: 'app-formulario-condominio',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MensajeErrorComponent],
  templateUrl: './formulario-condominio.component.html',
  styleUrls: ['./formulario-condominio.component.scss']
})
export class FormularioCondominioComponent implements OnInit {
  private constructorFormulario = inject(FormBuilder);
  private condominioServicio = inject(CondominioService);
  private enrutador = inject(Router);
  private rutaActiva = inject(ActivatedRoute);

  esEdicion = false;
  condominioId: number | null = null;

  formularioCondominio: FormGroup = this.constructorFormulario.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    torres: [1, [Validators.required, Validators.min(1)]],
    pisosPorTorre: [1, [Validators.required, Validators.min(1)]]
  });

  ngOnInit(): void {
    const idParam = this.rutaActiva.snapshot.paramMap.get('id');
    if (idParam) {
      this.esEdicion = true;
      this.condominioId = Number(idParam);
      this.cargarDatosCondominio(this.condominioId);
    }
  }

  cargarDatosCondominio(id: number): void {
    this.condominioServicio.obtenerCondominio(id).subscribe({
      next: (condominio) => {
        this.formularioCondominio.patchValue({
          nombre: condominio.nombre,
          torres: condominio.torres,
          pisosPorTorre: condominio.pisosPorTorre
        });
      },
      error: (err) => console.error(err)
    });
  }

  guardarDatos(): void {
    if (this.formularioCondominio.valid) {
      const operacion = this.esEdicion && this.condominioId
        ? this.condominioServicio.actualizarCondominio(this.condominioId, this.formularioCondominio.value)
        : this.condominioServicio.crearCondominio(this.formularioCondominio.value);

      operacion.subscribe({
        next: () => {
          this.enrutador.navigate(['/condominios']);
        },
        error: (error) => {
          console.error(error);
        }
      });
    } else {
      this.formularioCondominio.markAllAsTouched();
    }
  }

  cancelar(): void {
    this.enrutador.navigate(['/condominios']);
  }
}
