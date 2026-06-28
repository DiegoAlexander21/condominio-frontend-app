import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AutenticacionService } from '../../../nucleo/servicios/autenticacion.service';
import { BarraLateralComponent } from '../barra-lateral/barra-lateral';
import { BarraSuperiorComponent } from '../barra-superior/barra-superior';
import { ModalConfirmacionComponent } from '../modal-confirmacion/modal-confirmacion';

@Component({
  selector: 'app-plantilla-navegacion',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    BarraLateralComponent, 
    BarraSuperiorComponent, 
    ModalConfirmacionComponent
  ],
  templateUrl: './plantilla-navegacion.html',
  styleUrls: ['./plantilla-navegacion.scss']
})
export class PlantillaNavegacionComponent {
  private enrutador = inject(Router);
  private servicioAutenticacion = inject(AutenticacionService);

  menuAbierto = signal<boolean>(false);
  mostrarModalSalir = signal<boolean>(false);

  alternarMenu(): void {
    this.menuAbierto.update(v => !v);
  }

  cerrarMenuMovil(): void {
    if (window.innerWidth <= 768) {
      this.menuAbierto.set(false);
    }
  }

  abrirModalSalir(): void {
    this.mostrarModalSalir.set(true);
    this.cerrarMenuMovil();
  }

  cancelarCierreSesion(): void {
    this.mostrarModalSalir.set(false);
  }

  confirmarCierreSesion(): void {
    this.servicioAutenticacion.cerrarSesion();
    this.mostrarModalSalir.set(false);
    this.enrutador.navigate(['/login']);
  }
}
