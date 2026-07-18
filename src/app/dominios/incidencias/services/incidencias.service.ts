import { Injectable } from '@angular/core';
import { inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IncidenciaResponse, EstadoIncidencia } from '../modelos/incidencia-response';
import { IncidenciaForm, ActualizacionIncidenciaForm } from '../modelos/incidencia-form';
import { RespuestaPaginada } from '../../../compartido/modelos/respuesta-paginada.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class IncidenciasService {

  private httpClient = inject(HttpClient);
  private urlBase = `${environment.apiUrl}/incidencias`;

  obtenerListaPorEstado(estado?: EstadoIncidencia, unidadId?: number, pagina: number = 0, tamano: number = 10): Observable<RespuestaPaginada<IncidenciaResponse>> {
    let params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('tamano', tamano.toString());
      
    if (estado) {
      params = params.set('estado', estado);
    }
    
    if (unidadId) {
      params = params.set('unidadId', unidadId.toString());
    }

    return this.httpClient.get<RespuestaPaginada<IncidenciaResponse>>(this.urlBase, { params });
  }

  obtenerIncidencia(id: number): Observable<IncidenciaResponse> {
    return this.httpClient.get<IncidenciaResponse>(`${this.urlBase}/${id}`);
  }

  obtenerEvidencias(id: number): Observable<string[]> {
    return this.httpClient.get<string[]>(`${this.urlBase}/${id}/evidencias`);
  }

  registrarIncidenciaArea(formulario: IncidenciaForm): Observable<IncidenciaResponse> {
    return this.httpClient.post<IncidenciaResponse>(`${this.urlBase}/area`, formulario);
  }

  registrarIncidenciaUnidad(formulario: IncidenciaForm): Observable<IncidenciaResponse> {
    return this.httpClient.post<IncidenciaResponse>(`${this.urlBase}/unidad`, formulario);
  }

  actualizarEstado(id: number, formulario: ActualizacionIncidenciaForm): Observable<IncidenciaResponse> {
    return this.httpClient.put<IncidenciaResponse>(`${this.urlBase}/${id}/estado`, formulario);
  }

}
