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

  guardarToken(token: string, recordarme: boolean): void {
    if (recordarme) {
      localStorage.setItem('token', token);
      sessionStorage.removeItem('token');
    } else {
      sessionStorage.setItem('token', token);
      localStorage.removeItem('token');
    }
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }

  cerrarSesion(): void {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
  }

  estaAutenticado(): boolean {
    const token = this.obtenerToken();
    if (!token) return false;
    
    const payload = this.decodificarToken(token);
    if (!payload || !payload.exp) return false;
    
    if (payload.exp * 1000 < Date.now()) {
      this.cerrarSesion();
      return false;
    }
    return true;
  }

  obtenerRoles(): string[] {
    const token = this.obtenerToken();
    if (!token) return [];
    const payload = this.decodificarToken(token);
    return payload?.roles || [];
  }

  obtenerUnidadId(): number | null {
    const token = this.obtenerToken();
    if (!token) return null;
    const payload = this.decodificarToken(token);
    return payload?.unidadId || null;
  }

  private decodificarToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }
}
