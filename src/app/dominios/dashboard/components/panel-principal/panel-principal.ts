import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';
import { GraficoIncidenciasComponent } from '../grafico-incidencias/grafico-incidencias';
import { GraficoGastosComponent } from '../grafico-gastos/grafico-gastos';
import { ListaMorosasComponent } from '../lista-morosas/lista-morosas';
import { ReporteDashboardResponse } from '../../modelos/reporte-dashboard.interface';
import { IncidenciaFrecuenteResponse } from '../../modelos/incidencia-frecuente.interface';
import { AreaGastoResponse } from '../../modelos/area-gasto.interface';
import { UnidadMorosaResponse } from '../../modelos/unidad-morosa.interface';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';

@Component({
  selector: 'app-panel-principal',
  standalone: true,
  imports: [CommonModule, GraficoIncidenciasComponent, GraficoGastosComponent, ListaMorosasComponent],
  templateUrl: './panel-principal.html',
  styleUrls: ['./panel-principal.scss']
})
export class PanelPrincipalComponent implements OnInit {
  private dashboardServicio = inject(DashboardService);
  private toastServicio = inject(ToastService);

  estadisticasIncidencias: IncidenciaFrecuenteResponse[] = [];
  estadisticasGastos: AreaGastoResponse[] = [];
  unidadesMorosas: UnidadMorosaResponse[] = [];
  cargando = true;

  ngOnInit(): void {
    this.cargarDatos();
  }

  private cargarDatos(): void {
    this.dashboardServicio.obtenerDashboard().subscribe({
      next: (datos: ReporteDashboardResponse) => {
        this.estadisticasIncidencias = datos.incidenciasFrecuentes || [];
        this.estadisticasGastos = datos.areasConMayorGasto || [];
        this.unidadesMorosas = datos.unidadesMorosas || [];
        this.cargando = false;
      },
      error: () => {
        this.toastServicio.mostrarError('Error al cargar datos del dashboard.');
        this.cargando = false;
      }
    });
  }
}
