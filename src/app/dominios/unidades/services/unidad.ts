import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UnidadForm } from '../modelos/unidad-form.interface';
import { UnidadResponse } from '../modelos/unidad-response.interface';
import { RespuestaPaginada } from '../../../compartido/modelos/respuesta-paginada.interface';
import { AsignarOcupantesForm } from '../modelos/asignar-ocupantes-form.interface';
import { TorreDto } from '../modelos/torre.dto';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UnidadService {
  private httpClient = inject(HttpClient);
  private urlBase = `${environment.apiUrl}/unidades`;

  obtenerListaUnidades(pagina: number = 0, tamano: number = 10): Observable<RespuestaPaginada<UnidadResponse>> {
    const parametros = new HttpParams()
      .set('pagina', pagina.toString())
      .set('tamano', tamano.toString());
      
    return this.httpClient.get<RespuestaPaginada<UnidadResponse>>(this.urlBase, { params: parametros });
  }

  obtenerUnidad(id: number): Observable<UnidadForm> {
    return this.httpClient.get<UnidadForm>(`${this.urlBase}/${id}`);
  }

  crearUnidad(unidad: UnidadForm): Observable<UnidadResponse> {
    return this.httpClient.post<UnidadResponse>(this.urlBase, unidad);
  }

  actualizarUnidad(id: number, unidad: UnidadForm): Observable<UnidadResponse> {
    return this.httpClient.put<UnidadResponse>(`${this.urlBase}/${id}`, unidad);
  }

  eliminarUnidad(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.urlBase}/${id}`);
  }

  obtenerOcupantes(id: number): Observable<AsignarOcupantesForm> {
    return this.httpClient.get<AsignarOcupantesForm>(`${this.urlBase}/${id}/ocupantes`);
  }

  asignarOcupantes(id: number, ocupantesForm: AsignarOcupantesForm): Observable<UnidadResponse> {
    return this.httpClient.put<UnidadResponse>(`${this.urlBase}/${id}/ocupantes`, ocupantesForm);
  }

  buscarTorresMultiples(condominioIds: number[]): Observable<TorreDto[]> {
    return this.httpClient.post<TorreDto[]>(`${this.urlBase}/busqueda/torres`, condominioIds);
  }

  buscarViviendasMultiples(torresDto: TorreDto[]): Observable<UnidadResponse[]> {
    return this.httpClient.post<UnidadResponse[]>(`${this.urlBase}/busqueda/viviendas`, torresDto);
  }
}
