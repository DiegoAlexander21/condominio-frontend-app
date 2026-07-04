import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { GastoResponse } from '../../modelos/finanzas.model';
import { IncidenciasService } from '../../../incidencias/services/incidencias.service';

@Component({
  selector: 'app-modal-detalle-gasto',
  standalone: true,
  imports: [CommonModule, TitleCasePipe],
  templateUrl: './modal-detalle-gasto.html',
  styleUrls: ['./modal-detalle-gasto.scss']
})
export class ModalDetalleGastoComponent implements OnChanges {
  @Input() gasto: GastoResponse | null = null;
  @Input() visible = false;
  @Output() cerrar = new EventEmitter<void>();

  detalleIncidencia: string | null = null;
  cargandoDetalleIncidencia = false;

  private incidenciasService = inject(IncidenciasService);
  private cdr = inject(ChangeDetectorRef);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['gasto'] && this.gasto) {
      this.cargarIncidencia();
    }
  }

  cargarIncidencia(): void {
    this.detalleIncidencia = null;
    this.cargandoDetalleIncidencia = false;
    
    if (this.gasto?.tipoGasto === 'EXTRAORDINARIO' && this.gasto?.incidenciaId) {
      this.cargandoDetalleIncidencia = true;
      this.incidenciasService.obtenerIncidencia(this.gasto.incidenciaId).subscribe({
        next: (inc) => {
          this.detalleIncidencia = inc.descripcion;
          this.cargandoDetalleIncidencia = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error fetching incidencia:', err);
          this.cargandoDetalleIncidencia = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  cerrarModal(): void {
    this.cerrar.emit();
  }

  cerrarModalFondo(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('fondo-modal')) {
      this.cerrarModal();
    }
  }
}
