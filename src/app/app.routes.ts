import { Routes } from '@angular/router';
import { autenticacionGuard } from './nucleo/guardianes/autenticacion.guard';

export const routes: Routes = [
  {
    path: 'registro',
    loadComponent: () => import('./dominios/seguridad/components/registro/registro').then(m => m.RegistroComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./dominios/seguridad/components/login/login.component').then(m => m.LoginComponent)
  },
  // Rutas privadas (envueltas en la plantilla de navegación y protegidas por guard)
  {
    path: '',
    canActivate: [autenticacionGuard],
    loadComponent: () => import('./compartido/componentes/plantilla-navegacion/plantilla-navegacion').then(m => m.PlantillaNavegacionComponent),
    children: [
      {
        path: 'condominios',
        loadComponent: () => import('./dominios/condominio/components/lista-condominios/lista-condominios.component').then(m => m.ListaCondominiosComponent)
      },
      {
        path: 'condominios/nuevo',
        loadComponent: () => import('./dominios/condominio/components/formulario-condominio/formulario-condominio.component').then(m => m.FormularioCondominioComponent)
      },
      {
        path: 'condominios/editar/:id',
        loadComponent: () => import('./dominios/condominio/components/formulario-condominio/formulario-condominio.component').then(m => m.FormularioCondominioComponent)
      },
      {
        path: '',
        redirectTo: 'condominios',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
