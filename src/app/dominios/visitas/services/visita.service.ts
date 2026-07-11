import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VisitaResponse, VisitaForm, RegistroIngresoVisitaForm, RegistroSalidaVisitaForm, EstadoVisita } from '../modelos/visita.model';
import { map } from 'rxjs/operators';

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
    return this.clienteHttp.get<VisitaResponse[]>(this.urlBase, { params }).pipe(
      map(visitas => visitas.map(v => this.parsearFechas(v)))
    );
  }

  listarVisitasPorUnidad(unidadId: number): Observable<VisitaResponse[]> {
    return this.clienteHttp.get<VisitaResponse[]>(`${this.urlBase}/unidad/${unidadId}`).pipe(
      map(visitas => visitas.map(v => this.parsearFechas(v)))
    );
  }

  registrarVisita(formulario: VisitaForm): Observable<VisitaResponse> {
    return this.clienteHttp.post<VisitaResponse>(this.urlBase, formulario).pipe(
      map(v => this.parsearFechas(v))
    );
  }

  registrarIngreso(formulario: RegistroIngresoVisitaForm): Observable<VisitaResponse> {
    return this.clienteHttp.post<VisitaResponse>(`${this.urlBase}/ingreso`, formulario).pipe(
      map(v => this.parsearFechas(v))
    );
  }

  registrarSalida(formulario: RegistroSalidaVisitaForm): Observable<VisitaResponse> {
    return this.clienteHttp.post<VisitaResponse>(`${this.urlBase}/salida`, formulario).pipe(
      map(v => this.parsearFechas(v))
    );
  }

  private parsearFechas(v: VisitaResponse): VisitaResponse {
    const r = { ...v };
    if (Array.isArray(r.fechaVisitaProgramada)) r.fechaVisitaProgramada = this.arregloAFechaISO(r.fechaVisitaProgramada);
    if (Array.isArray(r.fechaIngreso)) r.fechaIngreso = this.arregloAFechaISO(r.fechaIngreso);
    if (Array.isArray(r.fechaSalida)) r.fechaSalida = this.arregloAFechaISO(r.fechaSalida);
    if (Array.isArray(r.fechaRegistro)) r.fechaRegistro = this.arregloAFechaISO(r.fechaRegistro);
    return r;
  }

  private arregloAFechaISO(arreglo: number[]): string {
    if (!Array.isArray(arreglo) || arreglo.length < 3) return arreglo as any;
    const [anio, mes, dia, hora = 0, minuto = 0, segundo = 0] = arreglo;
    const fecha = new Date(Date.UTC(anio, mes - 1, dia, hora, minuto, segundo));
    return fecha.toISOString();
  }
}
