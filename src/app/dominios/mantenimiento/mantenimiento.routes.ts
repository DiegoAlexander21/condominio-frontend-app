import { Routes } from '@angular/router';

export const MANTENIMIENTO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/dashboard-mantenimiento/dashboard-mantenimiento').then(m => m.DashboardMantenimientoComponent)
  },
  {
    path: 'nuevo-insumo',
    loadComponent: () => import('./components/formulario-insumo/formulario-insumo').then(m => m.FormularioInsumoComponent)
  },
  {
    path: 'nueva-tarea',
    loadComponent: () => import('./components/formulario-tarea/formulario-tarea').then(m => m.FormularioTareaComponent)
  },
  {
    path: 'tareas',
    loadComponent: () => import('./components/lista-tareas/lista-tareas').then(m => m.ListaTareasComponent)
  }
];
