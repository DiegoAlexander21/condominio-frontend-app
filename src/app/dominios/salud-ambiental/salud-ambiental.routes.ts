import { Routes } from '@angular/router';
import { DashboardAmbientalComponent } from './components/dashboard-ambiental/dashboard-ambiental';
import { FormularioChecklistComponent } from './components/formulario-checklist/formulario-checklist';
import { EvaluacionChecklistComponent } from './components/evaluacion-checklist/evaluacion-checklist';
import { FormularioMantenimientoComponent } from './components/formulario-mantenimiento/formulario-mantenimiento';

export const SALUD_AMBIENTAL_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: DashboardAmbientalComponent
      },
      {
        path: 'nuevo-checklist',
        component: FormularioChecklistComponent
      },
      {
        path: 'evaluar/:id',
        component: EvaluacionChecklistComponent
      },
      {
        path: 'nuevo-mantenimiento',
        component: FormularioMantenimientoComponent
      }
    ]
  }
];
