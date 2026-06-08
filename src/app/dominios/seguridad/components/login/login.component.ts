import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MensajeErrorComponent } from '../../../../compartido/componentes/mensaje-error/mensaje-error';
import { AutenticacionService } from '../../../../nucleo/servicios/autenticacion.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MensajeErrorComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private constructorFormulario = inject(FormBuilder);
  private servicioAutenticacion = inject(AutenticacionService);
  private enrutador = inject(Router);

  mensajeExito: string | null = null;
  mensajeError: string | null = null;

  constructor() {
    if (history.state?.mensajeExito) {
      this.mensajeExito = history.state.mensajeExito;
      window.history.replaceState({}, '');
      setTimeout(() => {
        this.mensajeExito = null;
      }, 7000);
    }
  }

  formularioLogin: FormGroup = this.constructorFormulario.group({
    identificador: ['', [Validators.required, Validators.email]],
    contrasena: ['', [Validators.required, Validators.minLength(6)]],
    recordarme: [false]
  });

  procesarLogin(): void {
    if (this.formularioLogin.valid) {
      this.servicioAutenticacion.iniciarSesion(this.formularioLogin.value).subscribe({
        next: (respuesta) => {
          localStorage.setItem('token', respuesta.tokenAcceso);
          this.enrutador.navigate(['/condominios']);
        },
        error: (error) => {
          const codigoError = error.error?.codigo;
          
          if (codigoError === 'identificador_no_encontrado') {
            this.formularioLogin.get('identificador')?.setErrors({ noEncontrado: true });
          } else if (codigoError === 'contrasena_incorrecta') {
            this.formularioLogin.get('contrasena')?.setErrors({ incorrecta: true });
          } else {
            this.mensajeError = error.error?.error || 'Error al iniciar sesión.';
          }
        }
      });
    } else {
      this.formularioLogin.markAllAsTouched();
    }
  }

  iniciarConGoogle(): void {
    console.log('Iniciar sesión con Google');
  }
}
