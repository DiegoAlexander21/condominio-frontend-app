import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { AreaGastoResponse } from '../../modelos/area-gasto.interface';

@Component({
  selector: 'app-grafico-gastos',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './grafico-gastos.html',
  styleUrls: ['./grafico-gastos.scss']
})
export class GraficoGastosComponent implements OnChanges {
  @Input() datos: AreaGastoResponse[] = [];
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  public tipoGrafico: ChartType = 'bar';
  public opcionesGrafico: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return 'S/ ' + value;
          }
        }
      }
    }
  };

  public datosGrafico: ChartData<'bar', number[], string | string[]> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: '#4b5578',
        borderRadius: 4
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
    this.datosGrafico.datasets[0].data = this.datos.map(d => d.montoTotal);
    this.chart?.update();
  }
}
