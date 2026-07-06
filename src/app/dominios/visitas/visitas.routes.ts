import { Routes } from '@angular/router';
import { rolGuard } from '../../nucleo/guardianes/rol.guard';

export const visitasRoutes: Routes = [
  {
    path: 'residente',
    canActivate: [rolGuard],
    data: { roles: ['RESIDENTE', 'PROPIETARIO'] },
    loadComponent: () => import('./components/visitas-residente/visitas-residente.component').then(m => m.VisitasResidenteComponent)
  },
  {
    path: 'residente/nueva',
    canActivate: [rolGuard],
    data: { roles: ['RESIDENTE', 'PROPIETARIO'] },
    loadComponent: () => import('./components/formulario-visita/formulario-visita').then(m => m.FormularioVisitaComponent)
  },
  {
    path: 'conserje',
    canActivate: [rolGuard],
    data: { roles: ['CONSERJERIA', 'CONSERJERIA_MANTENIMIENTO'] },
    loadComponent: () => import('./components/visitas-conserje/visitas-conserje.component').then(m => m.VisitasConserjeComponent)
  },
  {
    path: 'admin',
    canActivate: [rolGuard],
    data: { roles: ['ADMINISTRADOR'] },
    loadComponent: () => import('./components/visitas-admin/visitas-admin.component').then(m => m.VisitasAdminComponent)
  },
  {
    path: '',
    redirectTo: 'residente',
    pathMatch: 'full'
  }
];
