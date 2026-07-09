import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CalificacionForm, EstadoAreaResponse, RespuestaDetalleArea } from '../modelos/calificacion.model';

@Injectable({
  providedIn: 'root'
})
export class CalificacionService {
  private urlBase = 'http://localhost:8080/api/calificaciones';

  constructor(private http: HttpClient) {}

  obtenerRankingAreas(): Observable<EstadoAreaResponse[]> {
    return this.http.get<EstadoAreaResponse[]>(`${this.urlBase}/ranking`);
  }

  obtenerCalificacionesPorArea(areaId: number): Observable<RespuestaDetalleArea> {
    return this.http.get<RespuestaDetalleArea>(`${this.urlBase}/area/${areaId}`);
  }

  registrarCalificacion(formulario: CalificacionForm): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${this.urlBase}/registrar`, formulario);
  }

  actualizarEstadoManual(areaId: number): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${this.urlBase}/area/${areaId}/actualizar-estado`, {});
  }
}
