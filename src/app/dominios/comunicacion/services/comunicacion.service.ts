import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ComunicadoForm, ComunicadoIAForm, ComunicadoResponse } from '../modelos/comunicado.model';
import { AsambleaForm, AsambleaResponse } from '../modelos/asamblea.model';
import { ResultadoAsambleaResponse, VotoAsambleaForm } from '../modelos/votacion.model';

@Injectable({
  providedIn: 'root'
})
export class ComunicacionService {
  private http = inject(HttpClient);
  private urlComunicados = 'http://localhost:8080/api/comunicados';
  private urlAsambleas = 'http://localhost:8080/api/asambleas';

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

  terminarAsamblea(id: number): Observable<any> {
    return this.http.put(`${this.urlAsambleas}/${id}/terminar`, {});
  }

  registrarAsamblea(formulario: AsambleaForm): Observable<any> {
    return this.http.post(this.urlAsambleas, formulario);
  }

  registrarVoto(formulario: VotoAsambleaForm): Observable<any> {
    return this.http.post(`${this.urlAsambleas}/votos`, formulario);
  }

  obtenerResultadosVotacion(asambleaId: number): Observable<ResultadoAsambleaResponse> {
    return this.http.get<ResultadoAsambleaResponse>(`${this.urlAsambleas}/resultados?asambleaId=${asambleaId}`);
  }

  verificarVoto(asambleaId: number, unidadId: number): Observable<{votoRegistrado: boolean}> {
    return this.http.get<{votoRegistrado: boolean}>(`${this.urlAsambleas}/${asambleaId}/voto?unidadId=${unidadId}`);
  }
}
