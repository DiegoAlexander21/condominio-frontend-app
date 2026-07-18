import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReporteDashboardResponse } from '../modelos/reporte-dashboard.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private clienteHttp = inject(HttpClient);
  private urlBase = `${environment.apiUrl}/reportes`;

  obtenerDashboard(): Observable<ReporteDashboardResponse> {
    return this.clienteHttp.get<ReporteDashboardResponse>(`${this.urlBase}/dashboard`);
  }
}
