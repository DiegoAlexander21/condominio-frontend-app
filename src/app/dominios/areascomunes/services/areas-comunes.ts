import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AreaComunResponse } from '../modelos/area-comun-response';
import { AreaComunForm } from '../modelos/area-comun-form';
import { RespuestaPaginada } from '../../../compartido/modelos/respuesta-paginada.interface';

@Injectable({
  providedIn: 'root'
})
export class AreasComunesService {
  private urlAPI = 'http://localhost:8080/api/areas-comunes';

  constructor(private clienteHttp: HttpClient) {}

  obtenerAreas(condominioId?: number, pagina: number = 0, tamano: number = 10): Observable<RespuestaPaginada<AreaComunResponse>> {
    let url = `${this.urlAPI}?pagina=${pagina}&tamano=${tamano}`;
    if (condominioId) {
      url += `&condominioId=${condominioId}`;
    }
    return this.clienteHttp.get<RespuestaPaginada<AreaComunResponse>>(url);
  }

  obtenerArea(id: number): Observable<AreaComunForm> {
    return this.clienteHttp.get<AreaComunForm>(`${this.urlAPI}/${id}`);
  }

  registrarArea(formulario: AreaComunForm): Observable<AreaComunResponse> {
    return this.clienteHttp.post<AreaComunResponse>(this.urlAPI, formulario);
  }

  eliminarArea(id: number): Observable<void> {
    return this.clienteHttp.delete<void>(`${this.urlAPI}/${id}`);
  }
}
