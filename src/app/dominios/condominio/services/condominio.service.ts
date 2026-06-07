import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Condominio } from '../models/condominio.model';

@Injectable({
  providedIn: 'root'
})
export class CondominioService {
  private httpClient = inject(HttpClient);
  private urlBase = 'http://localhost:8080/api/condominios';

  obtenerListaCondominios(): Observable<Condominio[]> {
    return this.httpClient.get<Condominio[]>(this.urlBase);
  }

  obtenerCondominio(id: number): Observable<Condominio> {
    return this.httpClient.get<Condominio>(`${this.urlBase}/${id}`);
  }

  crearCondominio(condominio: Condominio): Observable<Condominio> {
    return this.httpClient.post<Condominio>(this.urlBase, condominio);
  }

  actualizarCondominio(id: number, condominio: Condominio): Observable<Condominio> {
    return this.httpClient.put<Condominio>(`${this.urlBase}/${id}`, condominio);
  }
}
