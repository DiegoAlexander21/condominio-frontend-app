import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { UnidadService } from '../../services/unidad';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';
import { MensajeErrorComponent } from '../../../../compartido/componentes/mensaje-error/mensaje-error';



@Component({
  selector: 'app-asignar-ocupantes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MensajeErrorComponent],
  templateUrl: './asignar-ocupantes.html',
  styleUrls: ['./asignar-ocupantes.scss']
})
export class AsignarOcupantesComponent implements OnInit {
  private constructorFormulario = inject(FormBuilder);
  private unidadServicio = inject(UnidadService);
  private enrutador = inject(Router);
  private rutaActiva = inject(ActivatedRoute);
  private toastServicio = inject(ToastService);

  formularioOcupantes: FormGroup;
  idUnidad: number | null = null;
  estadoInicial: any;

  constructor() {
    this.formularioOcupantes = this.constructorFormulario.group({
      nombrePropietario: ['', [Validators.maxLength(150)]],
      dniPropietario: ['', [Validators.pattern('^([0-9]{8})?$')]],
      emailPropietario: ['', [Validators.email, Validators.maxLength(150)]],
      telefonoPropietario: ['', [Validators.maxLength(9)]],

      nombreResidente: ['', [Validators.maxLength(150)]],
      dniResidente: ['', [Validators.pattern('^([0-9]{8})?$')]],
      emailResidente: ['', [Validators.email, Validators.maxLength(150)]],
      parentesco: [{ value: '', disabled: true }, [Validators.maxLength(50)]],
      residenteActivo: [false]
    });
  }

  ngOnInit(): void {
    const idParametro = this.rutaActiva.snapshot.paramMap.get('id');
    if (idParametro) {
      this.idUnidad = Number(idParametro);
      this.cargarOcupantes();
    } else {
      this.volver();
    }

    this.formularioOcupantes.valueChanges.subscribe(valores => {
      this.actualizarValidadoresCondicionales(valores);
    });
  }

  private actualizarValidadoresCondicionales(valores: any): void {
    const nombreP = (valores.nombrePropietario || '').trim();
    const dniP = (valores.dniPropietario || '').trim();
    const emailP = (valores.emailPropietario || '').trim();
    const telP = (valores.telefonoPropietario || '').trim();

    const nombreR = (valores.nombreResidente || '').trim();
    const dniR = (valores.dniResidente || '').trim();
    const emailR = (valores.emailResidente || '').trim();
    const parentesco = (valores.parentesco || '').trim();

    const tieneDatosPropietario = !!(nombreP || dniP || emailP || telP);
    const residenteActivo = this.formularioOcupantes.get('residenteActivo')?.value === true;
    const tieneDatosResidente = residenteActivo && !!(nombreR || dniR || emailR || parentesco);

    const controlNombreP = this.formularioOcupantes.get('nombrePropietario');
    const controlDniP = this.formularioOcupantes.get('dniPropietario');
    const controlNombreR = this.formularioOcupantes.get('nombreResidente');
    const controlDniR = this.formularioOcupantes.get('dniResidente');

    if (tieneDatosPropietario || tieneDatosResidente) {
      controlNombreP?.setValidators([Validators.required, Validators.maxLength(150)]);
      controlDniP?.setValidators([Validators.required, Validators.pattern('^[0-9]{8}$')]);
      this.formularioOcupantes.get('emailPropietario')?.setValidators([Validators.required, Validators.email, Validators.maxLength(150)]);
      this.formularioOcupantes.get('telefonoPropietario')?.setValidators([Validators.required, Validators.pattern('^[0-9]{9}$')]);
    } else {
      controlNombreP?.setValidators([Validators.maxLength(150)]);
      controlDniP?.setValidators([Validators.pattern('^([0-9]{8})?$')]);
      this.formularioOcupantes.get('emailPropietario')?.setValidators([Validators.email, Validators.maxLength(150)]);
      this.formularioOcupantes.get('telefonoPropietario')?.setValidators([Validators.pattern('^([0-9]{9})?$')]);
    }

    if (residenteActivo) {
      controlNombreR?.enable({ emitEvent: false });
      controlDniR?.enable({ emitEvent: false });
      this.formularioOcupantes.get('emailResidente')?.enable({ emitEvent: false });
      this.formularioOcupantes.get('parentesco')?.enable({ emitEvent: false });

      controlNombreR?.setValidators([Validators.required, Validators.maxLength(150)]);
      controlDniR?.setValidators([Validators.required, Validators.pattern('^[0-9]{8}$')]);
      this.formularioOcupantes.get('emailResidente')?.setValidators([Validators.required, Validators.email, Validators.maxLength(150)]);
      this.formularioOcupantes.get('parentesco')?.setValidators([Validators.required, Validators.maxLength(50)]);
    } else {
      controlNombreR?.disable({ emitEvent: false });
      controlDniR?.disable({ emitEvent: false });
      this.formularioOcupantes.get('emailResidente')?.disable({ emitEvent: false });
      this.formularioOcupantes.get('parentesco')?.disable({ emitEvent: false });

      controlNombreR?.clearValidators();
      controlDniR?.clearValidators();
      this.formularioOcupantes.get('emailResidente')?.clearValidators();
      this.formularioOcupantes.get('parentesco')?.clearValidators();
    }

    controlNombreP?.updateValueAndValidity({ emitEvent: false });
    controlDniP?.updateValueAndValidity({ emitEvent: false });
    this.formularioOcupantes.get('emailPropietario')?.updateValueAndValidity({ emitEvent: false });
    this.formularioOcupantes.get('telefonoPropietario')?.updateValueAndValidity({ emitEvent: false });
    
    controlNombreR?.updateValueAndValidity({ emitEvent: false });
    controlDniR?.updateValueAndValidity({ emitEvent: false });
    this.formularioOcupantes.get('emailResidente')?.updateValueAndValidity({ emitEvent: false });
    this.formularioOcupantes.get('parentesco')?.updateValueAndValidity({ emitEvent: false });

    // Forzar actualización del estado global del formulario
    this.formularioOcupantes.updateValueAndValidity({ emitEvent: false });
  }

  private cargarOcupantes(): void {
    if (this.idUnidad) {
      this.unidadServicio.obtenerOcupantes(this.idUnidad).subscribe({
        next: (ocupantes) => {
          this.formularioOcupantes.patchValue({
            nombrePropietario: ocupantes.nombrePropietario || '',
            dniPropietario: ocupantes.dniPropietario || '',
            emailPropietario: ocupantes.emailPropietario || '',
            telefonoPropietario: ocupantes.telefonoPropietario || '',
            
            nombreResidente: ocupantes.nombreResidente || '',
            dniResidente: ocupantes.dniResidente || '',
            emailResidente: ocupantes.emailResidente || '',
            parentesco: ocupantes.parentesco || '',
            residenteActivo: ocupantes.residenteActivo !== false
          });
          this.estadoInicial = this.formularioOcupantes.getRawValue();
        },
        error: () => {
          this.toastServicio.mostrarError('Error al cargar los datos de los ocupantes.');
          this.volver();
        }
      });
    }
  }

  guardar(): void {
    if (this.formularioOcupantes.invalid) {
      this.formularioOcupantes.markAllAsTouched();
      return;
    }

    if (this.idUnidad) {
      const datosOcupantes = this.formularioOcupantes.getRawValue();
      
      this.unidadServicio.asignarOcupantes(this.idUnidad, datosOcupantes).subscribe({
        next: () => {
          this.toastServicio.mostrarExito('Ocupantes asignados exitosamente.');
          this.volver();
        },
        error: (error) => {
          const mensaje = error.error?.error || 'Error al asignar ocupantes.';
          this.toastServicio.mostrarError(mensaje);
        }
      });
    }
  }

  formularioHaCambiado(): boolean {
    if (!this.estadoInicial) return true;
    const actual = this.formularioOcupantes.getRawValue();
    
    if (this.estadoInicial.residenteActivo !== actual.residenteActivo) return true;
    
    if (!actual.residenteActivo) {
      return this.estadoInicial.nombrePropietario !== actual.nombrePropietario ||
             this.estadoInicial.dniPropietario !== actual.dniPropietario ||
             this.estadoInicial.emailPropietario !== actual.emailPropietario ||
             this.estadoInicial.telefonoPropietario !== actual.telefonoPropietario;
    }
    
    return JSON.stringify(this.estadoInicial) !== JSON.stringify(actual);
  }

  volver(): void {
    this.enrutador.navigate(['/unidades']);
  }
}
