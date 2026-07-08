import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SaludAmbientalService } from '../../services/salud-ambiental.service';
import { UsuarioService } from '../../../../nucleo/servicios/usuario.service';
import { UsuarioPerfilResponse } from '../../../../nucleo/modelos/usuario-perfil-response.interface';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';
import { AreaComunResponse } from '../../../areascomunes/modelos/area-comun-response';
import { MensajeErrorComponent } from '../../../../compartido/componentes/mensaje-error/mensaje-error';

@Component({
  selector: 'app-formulario-mantenimiento',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MensajeErrorComponent],
  templateUrl: './formulario-mantenimiento.html',
  styleUrls: ['./formulario-mantenimiento.scss']
})
export class FormularioMantenimientoComponent implements OnInit {
  private fb = inject(FormBuilder);
  private saludService = inject(SaludAmbientalService);
  private usuarioService = inject(UsuarioService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  formulario: FormGroup;
  areasComunes: AreaComunResponse[] = [];
  guardando = false;
  areaNombreReadOnly = '';

  constructor() {
    this.formulario = this.fb.group({
      areaComunId: ['', Validators.required],
      descripcion: ['', [Validators.required, Validators.maxLength(500)]],
      responsable: ['', [Validators.required, Validators.maxLength(100)]]
    });
  }

  ngOnInit(): void {
    const areaId = this.route.snapshot.queryParamMap.get('areaId');
    const areaNombre = this.route.snapshot.queryParamMap.get('areaNombre');

    if (areaId && areaNombre) {
      this.formulario.patchValue({ areaComunId: Number(areaId) });
      this.areaNombreReadOnly = areaNombre;
    } else {
      this.usuarioService.obtenerMiPerfil().subscribe({
        next: (perfil) => {
          if (perfil.condominioId) {
            this.cargarAreasComunes(perfil.condominioId);
          }
        },
        error: () => this.toastService.mostrarError('Error al cargar perfil')
      });
    }
  }

  private cargarAreasComunes(condominioId: number): void {
    this.saludService.obtenerAreasComunesPorCondominio(condominioId).subscribe({
      next: (areas) => this.areasComunes = areas,
      error: () => this.toastService.mostrarError('Error al cargar áreas comunes')
    });
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.toastService.mostrarAdvertencia('Revisa los campos del formulario');
      return;
    }

    this.guardando = true;
    this.saludService.registrarMantenimiento(this.formulario.value).subscribe({
      next: () => {
        this.toastService.mostrarExito('Registro de mantenimiento guardado');
        this.router.navigate(['/salud-ambiental']);
      },
      error: () => {
        this.toastService.mostrarError('Error al guardar el registro de mantenimiento');
        this.guardando = false;
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/salud-ambiental']);
  }
}
