import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RespuestaPaginada } from '../../../compartido/modelos/respuesta-paginada.interface';
import { 
  GastoResponse, 
  GastoForm, 
  DistribucionGastoForm, 
  DetalleGastoUnidadResponse,
  EstadoCuentaResponse,
  EstadoCuentaForm,
  PagoResponse,
  PagoForm,
  AprobacionPagoForm,
  MiEstadoCuentaResponse
} from '../modelos/finanzas.model';

@Injectable({
  providedIn: 'root'
})
export class FinanzasService {
  private url = 'http://localhost:8080/api/finanzas';

  constructor(private http: HttpClient) {}

  listarGastos(tipo?: string, page: number = 0, size: number = 10): Observable<RespuestaPaginada<GastoResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (tipo) {
      params = params.set('tipo', tipo);
    }
    return this.http.get<RespuestaPaginada<GastoResponse>>(`${this.url}/gastos`, { params });
  }

  obtenerGasto(id: number): Observable<GastoForm> {
    return this.http.get<GastoForm>(`${this.url}/gastos/${id}`);
  }

  registrarGasto(formulario: GastoForm): Observable<GastoResponse> {
    return this.http.post<GastoResponse>(`${this.url}/gastos`, formulario);
  }

  actualizarGasto(id: number, formulario: GastoForm): Observable<GastoResponse> {
    return this.http.put<GastoResponse>(`${this.url}/gastos/${id}`, formulario);
  }

  eliminarGasto(id: number): Observable<{mensaje: string}> {
    return this.http.delete<{mensaje: string}>(`${this.url}/gastos/${id}`);
  }

  distribuirGasto(formulario: DistribucionGastoForm): Observable<DetalleGastoUnidadResponse[]> {
    return this.http.post<DetalleGastoUnidadResponse[]>(`${this.url}/gastos/distribuir`, formulario);
  }

  listarDetallesGasto(id: number): Observable<DetalleGastoUnidadResponse[]> {
    return this.http.get<DetalleGastoUnidadResponse[]>(`${this.url}/gastos/${id}/detalles`);
  }

  listarEstadosCuenta(): Observable<EstadoCuentaResponse[]> {
    return this.http.get<EstadoCuentaResponse[]>(`${this.url}/estados-cuenta`);
  }

  generarEstadoCuenta(formulario: EstadoCuentaForm): Observable<EstadoCuentaResponse> {
    return this.http.post<EstadoCuentaResponse>(`${this.url}/estados-cuenta/generar`, formulario);
  }

  obtenerEstadoCuenta(id: number): Observable<EstadoCuentaResponse> {
    return this.http.get<EstadoCuentaResponse>(`${this.url}/estados-cuenta/${id}`);
  }

  verDesgloseEstadoCuenta(id: number): Observable<DetalleGastoUnidadResponse[]> {
    return this.http.get<DetalleGastoUnidadResponse[]>(`${this.url}/estados-cuenta/${id}/desglose`);
  }

  verDesglosePagosEstadoCuenta(id: number): Observable<PagoResponse[]> {
    return this.http.get<PagoResponse[]>(`${this.url}/estados-cuenta/${id}/pagos`);
  }

  eliminarEstadoCuenta(id: number): Observable<{mensaje: string}> {
    return this.http.delete<{mensaje: string}>(`${this.url}/estados-cuenta/${id}`);
  }

  verMiEstadoCuenta(): Observable<MiEstadoCuentaResponse> {
    return this.http.get<MiEstadoCuentaResponse>(`${this.url}/estados-cuenta/mis-estados`);
  }

  listarPagosPorUnidad(unidadId: number): Observable<PagoResponse[]> {
    return this.http.get<PagoResponse[]>(`${this.url}/pagos/unidad/${unidadId}`);
  }

  registrarPago(formulario: PagoForm): Observable<PagoResponse> {
    return this.http.post<PagoResponse>(`${this.url}/pagos`, formulario);
  }

  obtenerPagosPendientes(): Observable<PagoResponse[]> {
    return this.http.get<PagoResponse[]>(`${this.url}/pagos/pendientes`);
  }

  listarPagos(estado?: string, page: number = 0, size: number = 10): Observable<RespuestaPaginada<PagoResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (estado) {
      params = params.set('estado', estado);
    }
    return this.http.get<RespuestaPaginada<PagoResponse>>(`${this.url}/pagos`, { params });
  }

  aprobarPago(id: number, formulario: AprobacionPagoForm): Observable<PagoResponse> {
    return this.http.put<PagoResponse>(`${this.url}/pagos/${id}/aprobar`, formulario);
  }
}
