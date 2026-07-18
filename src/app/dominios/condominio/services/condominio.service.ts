import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CondominioForm } from '../modelos/condominio-form.interface';
import { CondominioResponse } from '../modelos/condominio-response.interface';
import { RespuestaPaginada } from '../../../compartido/modelos/respuesta-paginada.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CondominioService {
  private httpClient = inject(HttpClient);
  private urlBase = `${environment.apiUrl}/condominios`;

  obtenerListaCondominios(pagina: number = 0, tamano: number = 10): Observable<RespuestaPaginada<CondominioResponse>> {
    const parametros = new HttpParams()
      .set('pagina', pagina.toString())
      .set('tamano', tamano.toString());
      
    return this.httpClient.get<RespuestaPaginada<CondominioResponse>>(this.urlBase, { params: parametros });
  }

  obtenerCondominio(id: number): Observable<CondominioForm> {
    return this.httpClient.get<CondominioForm>(`${this.urlBase}/${id}`);
  }

  crearCondominio(condominio: CondominioForm): Observable<CondominioResponse> {
    return this.httpClient.post<CondominioResponse>(this.urlBase, condominio);
  }

  actualizarCondominio(id: number, condominio: CondominioForm): Observable<CondominioResponse> {
    return this.httpClient.put<CondominioResponse>(`${this.urlBase}/${id}`, condominio);
  }

  eliminarCondominio(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.urlBase}/${id}`);
  }
}
