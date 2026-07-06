import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { IncidenciaFrecuenteResponse } from '../../modelos/incidencia-frecuente.interface';

@Component({
  selector: 'app-grafico-incidencias',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './grafico-incidencias.html',
  styleUrls: ['./grafico-incidencias.scss']
})
export class GraficoIncidenciasComponent implements OnChanges {
  @Input() datos: IncidenciaFrecuenteResponse[] = [];
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  public tipoGrafico: ChartType = 'doughnut';
  public opcionesGrafico: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: { family: "'Lora', Georgia, serif" }
        }
      }
    }
  };

  public datosGrafico: ChartData<'doughnut', number[], string | string[]> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: ['#313852', '#4b5578', '#a9b0c0', '#28b53d', '#de4b4b']
      }
    ]
  };

  ngOnChanges(cambios: SimpleChanges): void {
    if (cambios['datos'] && this.datos) {
      this.actualizarGrafico();
    }
  }

  private actualizarGrafico(): void {
    this.datosGrafico.labels = this.datos.map(d => d.areaComunNombre);
    this.datosGrafico.datasets[0].data = this.datos.map(d => d.totalIncidencias);
    this.chart?.update();
  }
}
