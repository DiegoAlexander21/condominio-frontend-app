import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChecklistForm, ChecklistResponse } from '../modelos/checklist.model';
import { EvaluacionForm, EvaluacionResponse } from '../modelos/evaluacion.model';
import { MantenimientoAmbientalForm, MantenimientoAmbientalResponse } from '../modelos/mantenimiento-ambiental.model';
import { AreaComunResponse } from '../../areascomunes/modelos/area-comun-response';
import { RespuestaPaginada } from '../../../compartido/modelos/respuesta-paginada.interface';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SaludAmbientalService {
  private http = inject(HttpClient);
  private urlBase = `${environment.apiUrl}/salud-ambiental`;
  private urlAreas = `${environment.apiUrl}/areas-comunes`;

  obtenerAreasComunesPorCondominio(condominioId: number): Observable<AreaComunResponse[]> {
    return this.http.get<RespuestaPaginada<AreaComunResponse>>(`${this.urlAreas}?condominioId=${condominioId}&tamano=10000`)
      .pipe(map(res => res.contenido));
  }

  crearChecklist(formulario: ChecklistForm): Observable<ChecklistResponse> {
    return this.http.post<ChecklistResponse>(`${this.urlBase}/checklists`, formulario).pipe(
      map(res => this.parsearFechasObjeto(res, 'fechaRegistro'))
    );
  }

  listarChecklistsPorArea(areaId: number): Observable<ChecklistResponse[]> {
    return this.http.get<ChecklistResponse[]>(`${this.urlBase}/checklists/area/${areaId}`).pipe(
      map(lista => lista.map(item => this.parsearFechasObjeto(item, 'fechaRegistro')))
    );
  }

  evaluarChecklist(formulario: EvaluacionForm): Observable<EvaluacionResponse> {
    return this.http.post<EvaluacionResponse>(`${this.urlBase}/evaluaciones`, formulario).pipe(
      map(res => this.parsearFechasObjeto(res, 'fechaEvaluacion'))
    );
  }

  registrarMantenimiento(formulario: MantenimientoAmbientalForm): Observable<MantenimientoAmbientalResponse> {
    return this.http.post<MantenimientoAmbientalResponse>(`${this.urlBase}/mantenimientos`, formulario).pipe(
      map(res => this.parsearFechasObjeto(res, 'fechaRegistro'))
    );
  }

  obtenerHistorialMantenimiento(areaId: number): Observable<MantenimientoAmbientalResponse[]> {
    return this.http.get<MantenimientoAmbientalResponse[]>(`${this.urlBase}/mantenimientos/area/${areaId}`).pipe(
      map(lista => lista.map(item => this.parsearFechasObjeto(item, 'fechaRegistro')))
    );
  }

  private parsearFechasObjeto<T>(objeto: T, campo: keyof T): T {
    if (objeto && Array.isArray(objeto[campo])) {
      const arr = objeto[campo] as unknown as number[];
      const pad = (n: number) => n?.toString().padStart(2, '0') || '00';
      const [y, m, d, h = 0, min = 0, s = 0] = arr;
      (objeto[campo] as unknown as string) = `${y}-${pad(m)}-${pad(d)}T${pad(h)}:${pad(min)}:${pad(s)}`;
    }
    return objeto;
  }
}
