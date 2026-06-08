import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Credenciales, RespuestaAutenticacion, RegistroUsuario } from '../modelos/credenciales.model';

@Injectable({
  providedIn: 'root'
})
export class AutenticacionService {
  private clienteHttp = inject(HttpClient);
  private urlBase = 'http://localhost:8080/api/auth';

  iniciarSesion(credenciales: Credenciales): Observable<RespuestaAutenticacion> {
    return this.clienteHttp.post<RespuestaAutenticacion>(`${this.urlBase}/login`, credenciales);
  }

  registrar(datosRegistro: RegistroUsuario): Observable<any> {
    return this.clienteHttp.post(`${this.urlBase}/registro`, datosRegistro);
  }

  cerrarSesion(): void {
    localStorage.removeItem('token');
  }

  estaAutenticado(): boolean {
    return !!localStorage.getItem('token');
  }
}

