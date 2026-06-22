import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsuarioPerfilResponse } from '../modelos/usuario-perfil-response.interface';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private clienteHttp = inject(HttpClient);
  private urlBase = 'http://localhost:8080/api/usuarios';

  obtenerMiPerfil(): Observable<UsuarioPerfilResponse> {
    return this.clienteHttp.get<UsuarioPerfilResponse>(`${this.urlBase}/me`);
  }

  vincularUnidad(unidadId: number): Observable<void> {
    return this.clienteHttp.put<void>(`${this.urlBase}/me/vincular?unidadId=${unidadId}`, {});
  }
}
