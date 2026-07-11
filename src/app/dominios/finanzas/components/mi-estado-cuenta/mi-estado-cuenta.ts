import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanzasService } from '../../services/finanzas.service';
import { EstadoCuentaResponse, PagoResponse, UnidadResumen } from '../../modelos/finanzas.model';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';
import { ListaResumenMensualComponent } from '../lista-resumen-mensual/lista-resumen-mensual';
import { ListaHistorialPagosComponent } from '../lista-historial-pagos/lista-historial-pagos';

@Component({
  selector: 'app-mi-estado-cuenta',
  standalone: true,
  imports: [
    CommonModule, 
    ListaResumenMensualComponent,
    ListaHistorialPagosComponent
  ],
  templateUrl: './mi-estado-cuenta.html',
  styleUrl: './mi-estado-cuenta.scss'
})
export class MiEstadoCuentaComponent implements OnInit {
  unidad: UnidadResumen | null = null;
  cargando = true;
  pestanaActiva: 'estados' | 'pagos' = 'estados';

  estadosOriginales: EstadoCuentaResponse[] = [];
  pagosOriginales: PagoResponse[] = [];

  constructor(
    private finanzasService: FinanzasService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.finanzasService.verMiEstadoCuenta().subscribe({
      next: (data) => {
        this.unidad = data.unidad;
        this.estadosOriginales = data.estadosCuenta.sort((a: EstadoCuentaResponse, b: EstadoCuentaResponse) => {
          return new Date(b.periodo).getTime() - new Date(a.periodo).getTime();
        });

        this.pagosOriginales = data.pagos.sort((a: PagoResponse, b: PagoResponse) => {
          return new Date(b.fechaPago).getTime() - new Date(a.fechaPago).getTime();
        });
        
        this.cargando = false;
      },
      error: (err) => {
        if (err.status === 404) {
          this.unidad = {
            id: 0,
            numeroUnidad: '-',
            torre: '-',
            piso: 0,
            condominio: { nombre: '-' }
          };
          this.estadosOriginales = [];
          this.pagosOriginales = [];
        } else {
          this.toastService.mostrarError('Error al cargar la información financiera.');
        }
        this.cargando = false;
      }
    });
  }

  cambiarPestana(pestana: 'estados' | 'pagos'): void {
    this.pestanaActiva = pestana;
  }
}
