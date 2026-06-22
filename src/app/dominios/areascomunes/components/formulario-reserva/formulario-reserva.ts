import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AreasComunesService } from '../../services/areas-comunes';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';
import { AutenticacionService } from '../../../../nucleo/servicios/autenticacion.service';
import { UnidadService } from '../../../unidades/services/unidad';
import { UnidadResponse } from '../../../unidades/modelos/unidad-response.interface';
import { AreaComunForm } from '../../modelos/area-comun-form';
import { CondominioResponse } from '../../../condominio/modelos/condominio-response.interface';
import { CondominioService } from '../../../condominio/services/condominio.service';
import { AreaComunResponse } from '../../modelos/area-comun-response';
import { TooltipInformativoComponent } from '../../../../compartido/componentes/tooltip-informativo/tooltip-informativo';

import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-formulario-reserva',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TooltipInformativoComponent],
  templateUrl: './formulario-reserva.html',
  styleUrls: ['./formulario-reserva.scss']
})
export class FormularioReservaComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private areasComunesServicio = inject(AreasComunesService);
  private condominiosServicio = inject(CondominioService);
  private unidadServicio = inject(UnidadService);
  private toastServicio = inject(ToastService);
  private authServicio = inject(AutenticacionService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  condominioId: number | null = null;
  areaComunId: number | null = null;
  fechaPreseleccionada: string = '';

  formularioReserva!: FormGroup;
  esAdmin: boolean = false;
  unidadIdUsuario: number | null = null;
  listaUnidades: UnidadResponse[] = [];
  listaCondominios: CondominioResponse[] = [];
  listaAreas: AreaComunResponse[] = [];
  areaActual: AreaComunForm | null = null;

  ngOnInit(): void {
    const roles = this.authServicio.obtenerRoles();
    this.esAdmin = roles.includes('ADMINISTRADOR');
    this.unidadIdUsuario = this.authServicio.obtenerUnidadId();

    this.route.queryParams.subscribe(params => {
      this.condominioId = params['condominioId'] ? Number(params['condominioId']) : null;
      this.areaComunId = params['areaComunId'] ? Number(params['areaComunId']) : null;
      this.fechaPreseleccionada = params['fecha'] || '';

      this.formularioReserva = this.formBuilder.group({
        condominioId: [this.condominioId || null, Validators.required],
        areaComunId: [this.areaComunId || null, Validators.required],
        unidadId: [{ value: this.esAdmin ? null : this.unidadIdUsuario, disabled: !this.esAdmin }, Validators.required],
        fechaReserva: [this.fechaPreseleccionada || null, Validators.required],
        horaInicio: [null, Validators.required],
        horaFin: [null, Validators.required],
        responsableNombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]]
      });

      this.cargarCondominios();

      if (this.condominioId) {
        if (this.esAdmin) {
          this.cargarUnidades(this.condominioId);
        }
        this.cargarAreas(this.condominioId);
      }
      
      if (this.areaComunId) {
        this.cargarDatosArea(this.areaComunId);
      }

      this.formularioReserva.get('condominioId')?.valueChanges.subscribe(condId => {
        this.formularioReserva.patchValue({ areaComunId: null, unidadId: this.esAdmin ? null : this.unidadIdUsuario });
        this.listaAreas = [];
        this.listaUnidades = [];
        this.areaActual = null;
        if (condId) {
          this.cargarAreas(Number(condId));
          if (this.esAdmin) {
            this.cargarUnidades(Number(condId));
          }
        }
      });

      this.formularioReserva.get('areaComunId')?.valueChanges.subscribe(areaId => {
        this.areaActual = null;
        if (areaId) {
          this.cargarDatosArea(Number(areaId));
        }
      });
    });
  }

  private cargarCondominios(): void {
    this.condominiosServicio.obtenerListaCondominios(0, 100).subscribe({
      next: (res: any) => this.listaCondominios = res.contenido
    });
  }

  private cargarAreas(condominioId: number): void {
    this.areasComunesServicio.obtenerAreas(condominioId, 0, 100).subscribe({
      next: (res: any) => this.listaAreas = res.contenido
    });
  }

  private cargarUnidades(condominioId: number): void {
    this.unidadServicio.obtenerListaUnidades(0, 100).subscribe({
      next: (res: any) => {
        this.listaUnidades = res.contenido.filter((u: any) => u.condominioId === condominioId || true);
      }
    });
  }

  private cargarDatosArea(areaId: number): void {
    this.areasComunesServicio.obtenerArea(areaId).subscribe({
      next: (res) => {
        this.areaActual = res;
      }
    });
  }

  guardarReserva(): void {
    if (this.formularioReserva.invalid) {
      this.formularioReserva.markAllAsTouched();
      return;
    }

    const datos = this.formularioReserva.getRawValue();

    this.areasComunesServicio.registrarReserva(datos).subscribe({
      next: () => {
        this.toastServicio.mostrarExito('Reserva registrada exitosamente');
        this.volver();
      },
      error: (err) => {
        const mensaje = err.error?.message || 'Error al registrar la reserva';
        this.toastServicio.mostrarError(mensaje);
      }
    });
  }

  volver(): void {
    this.router.navigate(['/areas-comunes/reservas']);
  }
}
