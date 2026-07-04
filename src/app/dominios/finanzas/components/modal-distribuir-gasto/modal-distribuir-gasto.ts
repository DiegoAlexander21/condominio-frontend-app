import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GastoResponse, DistribucionGastoForm } from '../../modelos/finanzas.model';
import { FinanzasService } from '../../services/finanzas.service';
import { UnidadService } from '../../../unidades/services/unidad';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';

@Component({
  selector: 'app-modal-distribuir-gasto',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-distribuir-gasto.html',
  styleUrls: ['./modal-distribuir-gasto.scss']
})
export class ModalDistribuirGastoComponent implements OnChanges {
  @Input() gasto: GastoResponse | null = null;
  @Input() visible = false;
  
  @Output() confirmar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  unidadSeleccionadaId: number | null = null;
  listaUnidades: {id: number, nombre: string}[] = [];
  cargandoUnidades = false;
  procesando = false;

  private unidadService = inject(UnidadService);
  private finanzasService = inject(FinanzasService);
  private toastService = inject(ToastService);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible && this.gasto) {
      if (this.gasto.metodoDistribucion === 'COBRO_DIRECTO') {
        this.cargarUnidades();
      }
    }
  }

  cargarUnidades(): void {
    if (!this.gasto) return;
    this.cargandoUnidades = true;
    this.unidadSeleccionadaId = null;
    this.listaUnidades = [];

    this.unidadService.obtenerListaUnidades(0, 10000).subscribe({
      next: (resp) => {
        this.listaUnidades = resp.contenido
          .filter(u => u.condominioId === this.gasto!.condominioId)
          .filter(u => !this.gasto!.torre || u.torre === this.gasto!.torre)
          .map(u => {
            const prefijoTorre = u.torre 
              ? (u.torre.toLowerCase().includes('torre') ? u.torre : `Torre ${u.torre}`) + ' - ' 
              : '';
            return {
              id: u.id,
              nombre: `${prefijoTorre}Depto. ${u.numeroUnidad}`
            };
          });
        this.cargandoUnidades = false;
      },
      error: () => {
        this.toastService.mostrarError('Error al cargar unidades');
        this.cargandoUnidades = false;
        this.cerrarModal();
      }
    });
  }

  confirmarDistribucionDirecta(): void {
    if (!this.gasto || !this.unidadSeleccionadaId) {
      this.toastService.mostrarError('Debe seleccionar una unidad');
      return;
    }

    this.procesando = true;
    const form: DistribucionGastoForm = { 
      gastoId: this.gasto.id,
      unidadId: this.unidadSeleccionadaId
    };

    this.finanzasService.distribuirGasto(form).subscribe({
      next: () => {
        this.toastService.mostrarExito('Gasto distribuido exitosamente');
        this.procesando = false;
        this.confirmar.emit();
      },
      error: (err) => {
        this.toastService.mostrarError(err.error?.error || 'Error al distribuir gasto');
        this.procesando = false;
      }
    });
  }

  cerrarModal(): void {
    this.cancelar.emit();
  }

  cerrarModalFondo(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('fondo-modal')) {
      this.cerrarModal();
    }
  }
}
