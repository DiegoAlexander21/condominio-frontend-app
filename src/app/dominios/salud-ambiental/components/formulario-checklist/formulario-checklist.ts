import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SaludAmbientalService } from '../../services/salud-ambiental.service';
import { UsuarioService } from '../../../../nucleo/servicios/usuario.service';
import { UsuarioPerfilResponse } from '../../../../nucleo/modelos/usuario-perfil-response.interface';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';
import { AreaComunResponse } from '../../../areascomunes/modelos/area-comun-response';
import { MensajeErrorComponent } from '../../../../compartido/componentes/mensaje-error/mensaje-error';

@Component({
  selector: 'app-formulario-checklist',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MensajeErrorComponent],
  templateUrl: './formulario-checklist.html',
  styleUrls: ['./formulario-checklist.scss']
})
export class FormularioChecklistComponent implements OnInit {
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
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      items: this.fb.array([this.crearItem()], Validators.required)
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

  get items(): FormArray {
    return this.formulario.get('items') as FormArray;
  }

  crearItem(): FormGroup {
    return this.fb.group({
      descripcion: ['', [Validators.required, Validators.maxLength(200)]]
    });
  }

  agregarItem(): void {
    this.items.push(this.crearItem());
  }

  removerItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.toastService.mostrarAdvertencia('Revisa los campos del formulario');
      return;
    }

    if (this.items.length === 0) {
      this.toastService.mostrarAdvertencia('Debe agregar al menos un ítem al checklist');
      return;
    }

    this.guardando = true;

    const payload = { ...this.formulario.value };
    payload.items = payload.items.map((item: { descripcion: string }, index: number) => ({
      ...item,
      orden: index + 1
    }));

    this.saludService.crearChecklist(payload).subscribe({
      next: () => {
        this.toastService.mostrarExito('Checklist creado correctamente');
        this.router.navigate(['/salud-ambiental']);
      },
      error: () => {
        this.toastService.mostrarError('Error al crear el checklist');
        this.guardando = false;
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/salud-ambiental']);
  }
}
