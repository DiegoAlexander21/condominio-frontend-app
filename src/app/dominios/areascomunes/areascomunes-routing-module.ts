import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ListaAreasComponent } from './components/lista-areas/lista-areas';
import { FormularioAreaComponent } from './components/formulario-area/formulario-area';

const routes: Routes = [
  { path: '', component: ListaAreasComponent },
  { path: 'nuevo', component: FormularioAreaComponent },
  { path: 'editar/:id', component: FormularioAreaComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AreascomunesRoutingModule { }
