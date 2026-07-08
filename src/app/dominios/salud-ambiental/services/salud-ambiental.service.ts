import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChecklistForm, ChecklistResponse } from '../modelos/checklist.model';
import { EvaluacionForm, EvaluacionResponse } from '../modelos/evaluacion.model';
import { MantenimientoAmbientalForm, MantenimientoAmbientalResponse } from '../modelos/mantenimiento-ambiental.model';
import { AreaComunResponse } from '../../areascomunes/modelos/area-comun-response';
import { RespuestaPaginada } from '../../../compartido/modelos/respuesta-paginada.interface';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SaludAmbientalService {
  private http = inject(HttpClient);
  private urlBase = 'http://localhost:8080/api/salud-ambiental';
  private urlAreas = 'http://localhost:8080/api/areas-comunes';

  obtenerAreasComunesPorCondominio(condominioId: number): Observable<AreaComunResponse[]> {
    return this.http.get<RespuestaPaginada<AreaComunResponse>>(`${this.urlAreas}?condominioId=${condominioId}&tamano=10000`)
      .pipe(map(res => res.contenido));
  }

  crearChecklist(formulario: ChecklistForm): Observable<ChecklistResponse> {
    return this.http.post<ChecklistResponse>(`${this.urlBase}/checklists`, formulario);
  }

  listarChecklistsPorArea(areaId: number): Observable<ChecklistResponse[]> {
    return this.http.get<ChecklistResponse[]>(`${this.urlBase}/checklists/area/${areaId}`);
  }

  evaluarChecklist(formulario: EvaluacionForm): Observable<EvaluacionResponse> {
    return this.http.post<EvaluacionResponse>(`${this.urlBase}/evaluaciones`, formulario);
  }

  registrarMantenimiento(formulario: MantenimientoAmbientalForm): Observable<MantenimientoAmbientalResponse> {
    return this.http.post<MantenimientoAmbientalResponse>(`${this.urlBase}/mantenimientos`, formulario);
  }

  obtenerHistorialMantenimiento(areaId: number): Observable<MantenimientoAmbientalResponse[]> {
    return this.http.get<MantenimientoAmbientalResponse[]>(`${this.urlBase}/mantenimientos/area/${areaId}`);
  }
}
