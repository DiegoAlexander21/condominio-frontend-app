import { Routes } from '@angular/router';
import { rolGuard } from '../../nucleo/guardianes/rol.guard';

export const RUTAS_PAQUETERIA: Routes = [
  {
    path: 'conserje',
    canActivate: [rolGuard],
    data: { roles: ['CONSERJERIA', 'CONSERJERIA_MANTENIMIENTO'] },
    loadComponent: () => import('./components/lista-paquetes-conserje/lista-paquetes-conserje.component').then(m => m.ListaPaquetesConserjeComponent)
  },
  {
    path: 'conserje/nuevo',
    canActivate: [rolGuard],
    data: { roles: ['CONSERJERIA', 'CONSERJERIA_MANTENIMIENTO'] },
    loadComponent: () => import('./components/formulario-paquete/formulario-paquete.component').then(m => m.FormularioPaqueteComponent)
  },
  {
    path: 'residente',
    canActivate: [rolGuard],
    data: { roles: ['RESIDENTE', 'PROPIETARIO'] },
    loadComponent: () => import('./components/lista-paquetes-residente/lista-paquetes-residente.component').then(m => m.ListaPaquetesResidenteComponent)
  },
  {
    path: '',
    redirectTo: 'conserje',
    pathMatch: 'full'
  }
];
