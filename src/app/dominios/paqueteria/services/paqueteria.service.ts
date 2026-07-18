import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Paquete } from '../modelos/paquete.model';
import { PaqueteForm, RegistroEntregaPaqueteForm } from '../modelos/paquete-form.model';
import { EstadoPaquete } from '../modelos/estado-paquete.enum';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaqueteriaService {
  private http = inject(HttpClient);
  private urlBase = `${environment.apiUrl}/paqueteria`;

  listarTodos(estado?: EstadoPaquete): Observable<Paquete[]> {
    let params = new HttpParams();
    if (estado) {
      params = params.set('estado', estado);
    }
    return this.http.get<Paquete[]>(this.urlBase, { params }).pipe(
      map(paquetes => paquetes.map(p => this.parsearFechas(p)))
    );
  }

  listarPorUnidad(unidadId: number): Observable<Paquete[]> {
    return this.http.get<Paquete[]>(`${this.urlBase}/unidad/${unidadId}`).pipe(
      map(paquetes => paquetes.map(p => this.parsearFechas(p)))
    );
  }

  registrarRecepcion(formulario: PaqueteForm): Observable<Paquete> {
    return this.http.post<Paquete>(this.urlBase, formulario).pipe(
      map(p => this.parsearFechas(p))
    );
  }

  registrarEntrega(id: number, formulario: RegistroEntregaPaqueteForm): Observable<Paquete> {
    return this.http.put<Paquete>(`${this.urlBase}/${id}/entrega`, formulario).pipe(
      map(p => this.parsearFechas(p))
    );
  }

  private parsearFechas(paquete: Paquete): Paquete {
    const pad = (n: number) => n.toString().padStart(2, '0');
    if (Array.isArray(paquete.fechaRecepcion)) {
      const [y, m, d, h = 0, min = 0, s = 0] = paquete.fechaRecepcion;
      paquete.fechaRecepcion = `${y}-${pad(m)}-${pad(d)}T${pad(h)}:${pad(min)}:${pad(s)}`;
    }
    if (Array.isArray(paquete.fechaEntrega)) {
      const [y, m, d, h = 0, min = 0, s = 0] = paquete.fechaEntrega;
      paquete.fechaEntrega = `${y}-${pad(m)}-${pad(d)}T${pad(h)}:${pad(min)}:${pad(s)}`;
    }
    return paquete;
  }
}
