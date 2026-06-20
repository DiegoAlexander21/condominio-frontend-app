import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HistorialTitularidadResponse } from '../modelos/historial-response';
import { RespuestaPaginada } from '../../../compartido/modelos/respuesta-paginada.interface';

@Injectable({
  providedIn: 'root'
})
export class HistorialService {

  private clienteHttp = inject(HttpClient);
  private urlBase = 'http://localhost:8080/api/historial';

  obtenerListaHistorial(pagina: number, tamano: number, terminoBusqueda?: string): Observable<RespuestaPaginada<HistorialTitularidadResponse>> {
    let parametros = new HttpParams()
      .set('pagina', pagina.toString())
      .set('tamano', tamano.toString());

    if (terminoBusqueda) {
      parametros = parametros.set('termino', terminoBusqueda);
    }

    return this.clienteHttp.get<RespuestaPaginada<HistorialTitularidadResponse>>(this.urlBase, { params: parametros });
  }
}
