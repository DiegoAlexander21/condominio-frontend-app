import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ComunicadoForm, ComunicadoIAForm, ComunicadoResponse } from '../modelos/comunicado.model';
import { AsambleaForm, AsambleaResponse } from '../modelos/asamblea.model';
import { ResultadoAsambleaResponse, VotoAsambleaForm } from '../modelos/votacion.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ComunicacionService {
  private http = inject(HttpClient);
  private urlComunicados = `${environment.apiUrl}/comunicados`;
  private urlAsambleas = `${environment.apiUrl}/asambleas`;

  obtenerComunicados(condominioId: number): Observable<ComunicadoResponse[]> {
    return this.http.get<ComunicadoResponse[]>(`${this.urlComunicados}/condominio/${condominioId}`);
  }

  registrarComunicado(formulario: ComunicadoForm): Observable<ComunicadoResponse> {
    return this.http.post<ComunicadoResponse>(this.urlComunicados, formulario);
  }

  generarConIA(formulario: ComunicadoIAForm): Observable<ComunicadoResponse> {
    return this.http.post<ComunicadoResponse>(`${this.urlComunicados}/generar-ia`, formulario);
  }

  obtenerAsambleas(condominioId: number): Observable<AsambleaResponse[]> {
    return this.http.get<AsambleaResponse[]>(`${this.urlAsambleas}?condominioId=${condominioId}`);
  }

  obtenerAsambleaPorId(id: number): Observable<AsambleaResponse> {
    return this.http.get<AsambleaResponse>(`${this.urlAsambleas}/${id}`);
  }

  terminarAsamblea(id: number): Observable<{ mensaje: string }> {
    return this.http.put<{ mensaje: string }>(`${this.urlAsambleas}/${id}/terminar`, {});
  }

  registrarAsamblea(formulario: AsambleaForm): Observable<AsambleaResponse> {
    return this.http.post<AsambleaResponse>(this.urlAsambleas, formulario);
  }

  registrarVoto(formulario: VotoAsambleaForm): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${this.urlAsambleas}/votos`, formulario);
  }

  obtenerResultadosVotacion(asambleaId: number): Observable<ResultadoAsambleaResponse> {
    return this.http.get<ResultadoAsambleaResponse>(`${this.urlAsambleas}/resultados?asambleaId=${asambleaId}`);
  }

  verificarVoto(asambleaId: number, unidadId: number): Observable<{votoRegistrado: boolean}> {
    return this.http.get<{votoRegistrado: boolean}>(`${this.urlAsambleas}/${asambleaId}/voto?unidadId=${unidadId}`);
  }
}
