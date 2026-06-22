import { Routes } from '@angular/router';
import { autenticacionGuard } from '../../nucleo/guardianes/autenticacion.guard';
import { rolGuard } from '../../nucleo/guardianes/rol.guard';
import { ListaIncidencias } from './components/lista-incidencias/lista-incidencias';
import { FormularioIncidencia } from './components/formulario-incidencia/formulario-incidencia';

export const incidenciasRoutes: Routes = [
  {
    path: '',
    component: ListaIncidencias,
    canActivate: [autenticacionGuard]
  },
  {
    path: 'nuevo',
    component: FormularioIncidencia,
    canActivate: [autenticacionGuard, rolGuard],
    data: { roles: ['RESIDENTE', 'ADMINISTRADOR'] }
  }
];
