import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AutenticacionService } from '../../services/autenticacion.service';
import { TipoDocumento, NombreRol } from '../../models/credenciales.model';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './registro.html',
  styleUrls: ['./registro.scss']
})
export class RegistroComponent {
  private constructorFormulario = inject(FormBuilder);
  private servicioAutenticacion = inject(AutenticacionService);
  private enrutador = inject(Router);

  mensajeServidor: string | null = null;

  tiposDocumento = Object.values(TipoDocumento);
  nombresRoles = Object.values(NombreRol);

  formularioRegistro: FormGroup = this.constructorFormulario.group({
    nombres: ['', [Validators.required, Validators.minLength(2)]],
    apellidos: ['', [Validators.required, Validators.minLength(2)]],
    tipoDocumento: ['', [Validators.required]],
    numeroDocumento: ['', [Validators.required, Validators.minLength(8)]],
    telefono: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
    correo: ['', [Validators.required, Validators.email]],
    contrasena: ['', [Validators.required, Validators.minLength(6)]],
    rol: ['', [Validators.required]]
  });

  procesarRegistro(): void {
    if (this.formularioRegistro.valid) {
      this.servicioAutenticacion.registrar(this.formularioRegistro.value).subscribe({
        next: () => {
          this.mensajeServidor = null;
          this.enrutador.navigate(['/login'], { state: { mensajeExito: '¡Tu cuenta ha sido creada con éxito! Por favor, inicia sesión.' } });
        },
        error: (error) => {
          this.mensajeServidor = error.error?.error || 'Error inesperado al intentar registrar el usuario.';
        }
      });
    } else {
      this.formularioRegistro.markAllAsTouched();
    }
  }
}
