import { Component, inject } from '@angular/core';
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

  menuAbierto: boolean = false;
  mostrarModalSalir: boolean = false;

  alternarMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarMenuMovil(): void {
    if (window.innerWidth <= 768) {
      this.menuAbierto = false;
    }
  }

  abrirModalSalir(): void {
    this.mostrarModalSalir = true;
    this.cerrarMenuMovil();
  }

  cancelarCierreSesion(): void {
    this.mostrarModalSalir = false;
  }

  confirmarCierreSesion(): void {
    this.servicioAutenticacion.cerrarSesion();
    this.mostrarModalSalir = false;
    this.enrutador.navigate(['/login']);
  }
}
