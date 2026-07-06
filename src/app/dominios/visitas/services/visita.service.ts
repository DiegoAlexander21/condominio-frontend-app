import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VisitaResponse, VisitaForm, RegistroIngresoVisitaForm, RegistroSalidaVisitaForm, EstadoVisita } from '../models/visita.model';

@Injectable({
  providedIn: 'root'
})
export class VisitaService {
  private urlBase = 'http://localhost:8080/api/visitas';
  private clienteHttp = inject(HttpClient);

  listarVisitas(estado?: EstadoVisita): Observable<VisitaResponse[]> {
    let params = new HttpParams();
    if (estado) {
      params = params.set('estado', estado);
    }
    return this.clienteHttp.get<VisitaResponse[]>(this.urlBase, { params });
  }

  listarVisitasPorUnidad(unidadId: number): Observable<VisitaResponse[]> {
    return this.clienteHttp.get<VisitaResponse[]>(`${this.urlBase}/unidad/${unidadId}`);
  }

  registrarVisita(formulario: VisitaForm): Observable<VisitaResponse> {
    return this.clienteHttp.post<VisitaResponse>(this.urlBase, formulario);
  }

  registrarIngreso(formulario: RegistroIngresoVisitaForm): Observable<VisitaResponse> {
    return this.clienteHttp.post<VisitaResponse>(`${this.urlBase}/ingreso`, formulario);
  }

  registrarSalida(formulario: RegistroSalidaVisitaForm): Observable<VisitaResponse> {
    return this.clienteHttp.post<VisitaResponse>(`${this.urlBase}/salida`, formulario);
  }
}
