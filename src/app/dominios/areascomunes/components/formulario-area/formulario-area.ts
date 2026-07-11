import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';

import { AreasComunesService } from '../../services/areas-comunes';
import { CondominioService } from '../../../condominio/services/condominio.service';
import { CondominioResponse } from '../../../condominio/modelos/condominio-response.interface';
import { AreaComunForm } from '../../modelos/area-comun-form';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';

@Component({
  selector: 'app-formulario-area',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './formulario-area.html',
  styleUrls: ['./formulario-area.scss']
})
export class FormularioAreaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private areasComunesServicio = inject(AreasComunesService);
  private condominioServicio = inject(CondominioService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastServicio = inject(ToastService);

  formulario: FormGroup;
  listaCondominios: CondominioResponse[] = [];
  areaId: number | null = null;
  cargando = false;
  errorMensaje: string | null = null;

  constructor() {
    this.formulario = this.fb.group({
      condominioId: ['', Validators.required],
      nombre: ['', [Validators.required, Validators.maxLength(150)]],
      capacidad: ['', [Validators.required, Validators.min(1)]],
      horaInicio: ['', Validators.required],
      horaFin: ['', Validators.required],
      normasUso: ['', Validators.maxLength(1000)]
    });
  }

  ngOnInit(): void {
    this.cargarCondominios();
    
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.areaId = Number(idParam);
      this.cargarDatosEdicion(this.areaId);
    }
  }

  cargarCondominios(): void {
    this.condominioServicio.obtenerListaCondominios(0, 100).subscribe({
      next: (respuesta) => {
        this.listaCondominios = respuesta.contenido;
      },
      error: () => this.errorMensaje = 'No se pudieron cargar los condominios.'
    });
  }

  cargarDatosEdicion(id: number): void {
    this.cargando = true;
    this.areasComunesServicio.obtenerArea(id).subscribe({
      next: (area) => {
        if (area) {
          this.formulario.patchValue({
            condominioId: area.condominioId,
            nombre: area.nombre,
            capacidad: area.capacidad,
            horaInicio: area.horaInicio,
            horaFin: area.horaFin,
            normasUso: area.normasUso
          });
        } else {
          this.errorMensaje = 'No se encontró el área común.';
        }
        this.cargando = false;
      },
      error: () => {
        this.errorMensaje = 'Error al cargar el área común.';
        this.cargando = false;
      }
    });
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valores = this.formulario.value;
    const datosGuardar: AreaComunForm = {
      id: this.areaId,
      condominioId: Number(valores.condominioId),
      nombre: valores.nombre,
      capacidad: Number(valores.capacidad),
      horaInicio: valores.horaInicio,
      horaFin: valores.horaFin,
      normasUso: valores.normasUso || null
    };



    this.cargando = true;
    this.errorMensaje = null;

    this.areasComunesServicio.registrarArea(datosGuardar).subscribe({
      next: () => {
        if (this.areaId) {
          this.toastServicio.mostrarExito('Área común editada exitosamente.');
        } else {
          this.toastServicio.mostrarExito('Área común registrada exitosamente.');
        }
        this.router.navigate(['/areas-comunes']);
      },
      error: (err: unknown) => {
        const error = err as { error?: { message?: string } };
        this.cargando = false;
        this.errorMensaje = error.error?.message || 'Ocurrió un error al guardar el área común.';
        this.toastServicio.mostrarError(this.errorMensaje!);
      }
    });
  }

  volver(): void {
    this.router.navigate(['/areas-comunes']);
  }
}
