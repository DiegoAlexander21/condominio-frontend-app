import { Routes } from '@angular/router';

export const RUTAS_COMUNICACION: Routes = [
  {
    path: 'comunicados',
    loadComponent: () => import('./components/lista-comunicados/lista-comunicados.component')
      .then(m => m.ListaComunicadosComponent)
  },
  {
    path: 'comunicados/nuevo',
    loadComponent: () => import('./components/formulario-comunicado/formulario-comunicado.component')
      .then(m => m.FormularioComunicadoComponent)
  },
/*
  {
    path: 'asambleas',
    loadComponent: () => import('./components/lista-asambleas/lista-asambleas.component')
      .then(m => m.ListaAsambleasComponent)
  },
  {
    path: 'asambleas/nueva',
    loadComponent: () => import('./components/formulario-asamblea/formulario-asamblea.component')
      .then(m => m.FormularioAsambleaComponent)
  },
  {
    path: 'asambleas/:id',
    loadComponent: () => import('./components/sala-asamblea/sala-asamblea.component')
      .then(m => m.SalaAsambleaComponent)
  },
*/
  {
    path: '',
    redirectTo: 'comunicados',
    pathMatch: 'full'
  }
];
