import { Routes } from '@angular/router';
import { autenticacionGuard } from './nucleo/guardianes/autenticacion.guard';
import { rolGuard } from './nucleo/guardianes/rol.guard';

export const routes: Routes = [
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
    canActivate: [autenticacionGuard],
    loadComponent: () => import('./compartido/componentes/plantilla-navegacion/plantilla-navegacion').then(m => m.PlantillaNavegacionComponent),
    children: [
      {
        path: 'condominios',
        canActivate: [rolGuard],
        data: { roles: ['ADMINISTRADOR', 'PROPIETARIO', 'RESIDENTE', 'CONSERJERIA_MANTENIMIENTO'] },
        loadComponent: () => import('./dominios/condominio/components/lista-condominios/lista-condominios.component').then(m => m.ListaCondominiosComponent)
      },
      {
        path: 'condominios/nuevo',
        canActivate: [rolGuard],
        data: { roles: ['ADMINISTRADOR'] },
        loadComponent: () => import('./dominios/condominio/components/formulario-condominio/formulario-condominio.component').then(m => m.FormularioCondominioComponent)
      },
      {
        path: 'condominios/editar/:id',
        canActivate: [rolGuard],
        data: { roles: ['ADMINISTRADOR'] },
        loadComponent: () => import('./dominios/condominio/components/formulario-condominio/formulario-condominio.component').then(m => m.FormularioCondominioComponent)
      },
      {
        path: 'unidades',
        canActivate: [rolGuard],
        data: { roles: ['ADMINISTRADOR', 'CONSERJERIA_MANTENIMIENTO'] },
        loadComponent: () => import('./dominios/unidades/components/lista-unidades/lista-unidades').then(m => m.ListaUnidadesComponent)
      },
      {
        path: 'unidades/nuevo',
        canActivate: [rolGuard],
        data: { roles: ['ADMINISTRADOR'] },
        loadComponent: () => import('./dominios/unidades/components/formulario-unidad/formulario-unidad').then(m => m.FormularioUnidadComponent)
      },
      {
        path: 'unidades/editar/:id',
        canActivate: [rolGuard],
        data: { roles: ['ADMINISTRADOR'] },
        loadComponent: () => import('./dominios/unidades/components/formulario-unidad/formulario-unidad').then(m => m.FormularioUnidadComponent)
      },
      {
        path: 'unidades/asignar-ocupantes/:id',
        canActivate: [rolGuard],
        data: { roles: ['ADMINISTRADOR'] },
        loadComponent: () => import('./dominios/unidades/components/asignar-ocupantes/asignar-ocupantes').then(m => m.AsignarOcupantesComponent)
      },
      {
        path: 'historial',
        canActivate: [rolGuard],
        data: { roles: ['ADMINISTRADOR'] },
        loadComponent: () => import('./dominios/historial/components/lista-historial/lista-historial').then(m => m.ListaHistorialComponent)
      },
      {
        path: 'perfil',
        canActivate: [rolGuard],
        data: { roles: ['ADMINISTRADOR', 'PROPIETARIO', 'RESIDENTE', 'CONSERJERIA'] },
        loadComponent: () => import('./dominios/seguridad/components/perfil/perfil').then(m => m.PerfilComponent)
      },
      {
        path: 'areas-comunes',
        canActivate: [rolGuard],
        data: { roles: ['ADMINISTRADOR', 'RESIDENTE'] },
        loadChildren: () => import('./dominios/areascomunes/areascomunes-module').then(m => m.AreascomunesModule)
      },
      {
        path: 'incidencias',
        canActivate: [rolGuard],
        data: { roles: ['ADMINISTRADOR', 'RESIDENTE'] },
        loadChildren: () => import('./dominios/incidencias/incidencias.routes').then(m => m.incidenciasRoutes)
      },
      {
        path: 'finanzas',
        canActivate: [rolGuard],
        data: { roles: ['ADMINISTRADOR', 'PROPIETARIO', 'RESIDENTE'] },
        loadChildren: () => import('./dominios/finanzas/finanzas.routes').then(m => m.finanzasRoutes)
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
