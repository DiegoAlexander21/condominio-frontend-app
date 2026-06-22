import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AreaComunResponse } from '../modelos/area-comun-response';
import { AreaComunForm } from '../modelos/area-comun-form';
import { RespuestaPaginada } from '../../../compartido/modelos/respuesta-paginada.interface';
import { ReservaAreaComunForm } from '../modelos/reserva-area-comun-form.interface';
import { ReservaAreaComunResponse } from '../modelos/reserva-area-comun-response.interface';

@Injectable({
  providedIn: 'root'
})
export class AreasComunesService {
  private urlAPI = 'http://localhost:8080/api/areas-comunes';
  private urlReservas = 'http://localhost:8080/api/reservas-areas';

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

  obtenerReservas(areaComunId: number, fecha?: string, pagina: number = 0, tamano: number = 10): Observable<RespuestaPaginada<ReservaAreaComunResponse>> {
    let url = `${this.urlReservas}?areaComunId=${areaComunId}&pagina=${pagina}&tamano=${tamano}&sort=id,desc`;
    if (fecha) {
      url += `&fecha=${fecha}`;
    }
    return this.clienteHttp.get<RespuestaPaginada<ReservaAreaComunResponse>>(url);
  }

  registrarReserva(formulario: ReservaAreaComunForm): Observable<ReservaAreaComunResponse> {
    return this.clienteHttp.post<ReservaAreaComunResponse>(this.urlReservas, formulario);
  }

  cancelarReserva(id: number): Observable<void> {
    return this.clienteHttp.delete<void>(`${this.urlReservas}/${id}`);
  }
}
