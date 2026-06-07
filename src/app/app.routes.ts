import { Routes } from '@angular/router';

export const routes: Routes = [
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
    path: 'registro',
    loadComponent: () => import('./dominios/seguridad/components/registro/registro').then(m => m.RegistroComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./dominios/seguridad/components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
