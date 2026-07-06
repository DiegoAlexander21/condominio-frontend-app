import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReporteDashboardResponse } from '../modelos/reporte-dashboard.interface';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private clienteHttp = inject(HttpClient);
  private urlBase = 'http://localhost:8080/api/reportes';

  obtenerDashboard(): Observable<ReporteDashboardResponse> {
    return this.clienteHttp.get<ReporteDashboardResponse>(`${this.urlBase}/dashboard`);
  }
}
