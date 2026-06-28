import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FinanzasService } from '../../services/finanzas.service';
import { UnidadService } from '../../../unidades/services/unidad';
import { CondominioService } from '../../../condominio/services/condominio.service';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';

import { MensajeErrorComponent } from '../../../../compartido/componentes/mensaje-error/mensaje-error';

@Component({
  selector: 'app-formulario-estado-cuenta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MensajeErrorComponent],
  templateUrl: './formulario-estado-cuenta.html',
  styleUrls: ['./formulario-estado-cuenta.scss']
})
export class FormularioEstadoCuentaComponent implements OnInit {
  private finanzasService = inject(FinanzasService);
  private unidadService = inject(UnidadService);
  private condominioService = inject(CondominioService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  formulario: FormGroup;
  guardando = false;
  cargandoDatos = false;

  listaCondominios: any[] = [];
  listaTorres: string[] = [];
  listaUnidadesGlobal: any[] = [];
  listaUnidadesFiltradas: any[] = [];

  constructor() {
    this.formulario = this.fb.group({
      unidadId: ['', Validators.required],
      periodo: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarDatosBase();
  }

  cargarDatosBase(): void {
    this.cargandoDatos = true;
    
    this.condominioService.obtenerListaCondominios(0, 1000).subscribe({
      next: (res) => {
        this.listaCondominios = res.contenido;
        this.cargarUnidades();
      },
      error: () => {
        this.toastService.mostrarError('Error al cargar los condominios');
        this.cargandoDatos = false;
      }
    });
  }

  cargarUnidades(): void {
    this.unidadService.obtenerListaUnidades(0, 1000).subscribe({
      next: (res) => {
        this.listaUnidadesGlobal = res.contenido.map(u => ({
          id: u.id,
          condominioId: u.condominioId,
          torre: u.torre,
          nombre: `Unidad N° ${u.numeroUnidad}${u.torre ? ' (' + u.torre + ')' : ''}`
        }));
        this.cargandoDatos = false;
      },
      error: () => {
        this.toastService.mostrarError('Error al cargar las unidades');
        this.cargandoDatos = false;
      }
    });
  }

  filtrarPorCondominio(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const condominioId = Number(selectElement.value);
    
    const unidadesDelCondominio = this.listaUnidadesGlobal.filter(u => u.condominioId === condominioId);
    
    const torresSet = new Set<string>();
    unidadesDelCondominio.forEach(u => {
      if (u.torre && u.torre.trim() !== '') {
        torresSet.add(u.torre.trim());
      }
    });
    
    this.listaTorres = Array.from(torresSet).sort();
    
    if (this.listaTorres.length === 0) {
       this.listaUnidadesFiltradas = unidadesDelCondominio;
    } else {
       this.listaUnidadesFiltradas = [];
    }

    this.formulario.get('unidadId')?.setValue('');
    
    const torreSelect = document.getElementById('filtroTorre') as HTMLSelectElement;
    if (torreSelect) {
      torreSelect.value = '';
    }
  }

  filtrarPorTorre(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const torre = selectElement.value;
    const condominioSelect = document.getElementById('condominioId') as HTMLSelectElement;
    const condominioId = Number(condominioSelect.value);
    
    if (torre === '') {
       this.listaUnidadesFiltradas = [];
    } else {
       this.listaUnidadesFiltradas = this.listaUnidadesGlobal.filter(u => 
         u.condominioId === condominioId && u.torre === torre
       );
    }
    this.formulario.get('unidadId')?.setValue('');
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.guardando = true;
    
    const formValue = { ...this.formulario.value };
    this.finanzasService.generarEstadoCuenta(formValue).subscribe({
      next: () => {
        this.toastService.mostrarExito('Estado de cuenta generado exitosamente.');
        this.guardando = false;
        this.router.navigate(['/finanzas/estados-cuenta']);
      },
      error: (err) => {
        this.toastService.mostrarError(err.error?.error || 'Error al generar estado de cuenta.');
        this.guardando = false;
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/finanzas/estados-cuenta']);
  }
}
