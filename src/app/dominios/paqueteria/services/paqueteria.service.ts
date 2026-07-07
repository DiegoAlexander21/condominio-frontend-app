import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Paquete } from '../models/paquete.model';
import { PaqueteForm, RegistroEntregaPaqueteForm } from '../models/paquete-form.model';
import { EstadoPaquete } from '../models/estado-paquete.enum';

@Injectable({
  providedIn: 'root'
})
export class PaqueteriaService {
  private http = inject(HttpClient);
  private urlBase = 'http://localhost:8080/api/paqueteria';

  listarTodos(estado?: EstadoPaquete): Observable<Paquete[]> {
    let params = new HttpParams();
    if (estado) {
      params = params.set('estado', estado);
    }
    return this.http.get<Paquete[]>(this.urlBase, { params });
  }

  listarPorUnidad(unidadId: number): Observable<Paquete[]> {
    return this.http.get<Paquete[]>(`${this.urlBase}/unidad/${unidadId}`);
  }

  registrarRecepcion(formulario: PaqueteForm): Observable<Paquete> {
    return this.http.post<Paquete>(this.urlBase, formulario);
  }

  registrarEntrega(id: number, formulario: RegistroEntregaPaqueteForm): Observable<Paquete> {
    return this.http.put<Paquete>(`${this.urlBase}/${id}/entrega`, formulario);
  }
}
