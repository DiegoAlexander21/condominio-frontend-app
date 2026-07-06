import { Component, EventEmitter, Input, Output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AutenticacionService } from '../../../nucleo/servicios/autenticacion.service';

@Component({
  selector: 'app-barra-lateral',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './barra-lateral.html',
  styleUrls: ['./barra-lateral.scss']
})
export class BarraLateralComponent implements OnInit {
  @Input() menuAbierto: boolean = false;
  @Output() alCerrar = new EventEmitter<void>();

  private authServicio = inject(AutenticacionService);
  esAdmin: boolean = false;
  esResidente: boolean = false;
  esConserje: boolean = false;

  ngOnInit(): void {
    const roles = this.authServicio.obtenerRoles();
    this.esAdmin = roles.includes('ADMINISTRADOR');
    this.esResidente = roles.includes('RESIDENTE') || roles.includes('PROPIETARIO');
    this.esConserje = roles.includes('CONSERJERIA') || roles.includes('CONSERJERIA_MANTENIMIENTO');
  }

  cerrarMenuMovil(): void {
    this.alCerrar.emit();
  }
}
