import { Routes } from '@angular/router';
import { RankingAreasComponent } from './components/ranking-areas/ranking-areas';
import { CalificarAreaComponent } from './components/calificar-area/calificar-area';
import { DetalleEstadoComponent } from './components/detalle-estado/detalle-estado';

export const calificacionesRoutes: Routes = [
  { path: '', component: RankingAreasComponent },
  { path: 'calificar/:id', component: CalificarAreaComponent },
  { path: 'area/:id', component: DetalleEstadoComponent }
];
