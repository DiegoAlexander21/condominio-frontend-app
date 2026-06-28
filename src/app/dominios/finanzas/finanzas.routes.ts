import { Routes } from '@angular/router';

export const finanzasRoutes: Routes = [
  {
    path: 'gastos',
    loadComponent: () => import('./components/lista-gastos/lista-gastos').then(m => m.ListaGastosComponent)
  },
  {
    path: 'gastos/nuevo',
    loadComponent: () => import('./components/formulario-gasto/formulario-gasto').then(m => m.FormularioGastoComponent)
  },
  {
    path: 'gastos/editar/:id',
    loadComponent: () => import('./components/formulario-gasto/formulario-gasto').then(m => m.FormularioGastoComponent)
  },
  {
    path: 'estados-cuenta',
    loadComponent: () => import('./components/estado-cuenta-admin/estado-cuenta-admin').then(m => m.EstadoCuentaAdminComponent)
  },
  {
    path: 'estados-cuenta/generar',
    loadComponent: () => import('./components/formulario-estado-cuenta/formulario-estado-cuenta').then(m => m.FormularioEstadoCuentaComponent)
  },
  {
    path: 'mi-estado-cuenta',
    loadComponent: () => import('./components/mi-estado-cuenta/mi-estado-cuenta').then(m => m.MiEstadoCuentaComponent)
  },
  {
    path: 'pagos',
    loadComponent: () => import('./components/gestion-pagos/gestion-pagos').then(m => m.GestionPagosComponent)
  },
  {
    path: '',
    redirectTo: 'gastos',
    pathMatch: 'full'
  }
];
