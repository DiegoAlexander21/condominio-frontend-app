import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InsumoResponse, InsumoForm } from '../modelos/insumo.model';
import { TareaMantenimientoForm, TareaMantenimientoResponse } from '../modelos/tarea-mantenimiento.model';
import { RespuestaPaginada } from '../../../compartido/modelos/respuesta-paginada.interface';

@Injectable({
  providedIn: 'root'
})
export class MantenimientoService {
  private http = inject(HttpClient);
  private urlBase = 'http://localhost:8080/api/mantenimiento';

  listarInsumos(): Observable<InsumoResponse[]> {
    return this.http.get<InsumoResponse[]>(`${this.urlBase}/insumos`);
  }

  listarInsumosCriticos(): Observable<InsumoResponse[]> {
    return this.http.get<InsumoResponse[]>(`${this.urlBase}/insumos/criticos`);
  }

  registrarInsumo(formulario: InsumoForm): Observable<InsumoResponse> {
    return this.http.post<InsumoResponse>(`${this.urlBase}/insumos`, formulario);
  }

  listarTareas(pagina: number = 0, tamano: number = 10): Observable<RespuestaPaginada<TareaMantenimientoResponse>> {
    const params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('tamano', tamano.toString());
      
    return this.http.get<RespuestaPaginada<TareaMantenimientoResponse>>(`${this.urlBase}/tareas`, { params });
  }

  registrarTarea(formulario: TareaMantenimientoForm): Observable<TareaMantenimientoResponse> {
    return this.http.post<TareaMantenimientoResponse>(`${this.urlBase}/tareas`, formulario);
  }
}
