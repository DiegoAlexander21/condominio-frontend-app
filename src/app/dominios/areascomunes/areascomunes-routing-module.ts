import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ListaAreasComponent } from './components/lista-areas/lista-areas';
import { FormularioAreaComponent } from './components/formulario-area/formulario-area';
import { GestionReservasComponent } from './components/gestion-reservas/gestion-reservas';
import { FormularioReservaComponent } from './components/formulario-reserva/formulario-reserva';

const routes: Routes = [
  { path: '', component: ListaAreasComponent },
  { path: 'nuevo', component: FormularioAreaComponent },
  { path: 'editar/:id', component: FormularioAreaComponent },
  { path: 'reservas', component: GestionReservasComponent },
  { path: 'reservas/nuevo', component: FormularioReservaComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AreascomunesRoutingModule { }
