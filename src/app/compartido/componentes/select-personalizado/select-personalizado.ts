import { Component, Input, forwardRef, ElementRef, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-select-personalizado',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './select-personalizado.html',
  styleUrls: ['./select-personalizado.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectPersonalizadoComponent),
      multi: true
    }
  ]
})
export class SelectPersonalizadoComponent implements ControlValueAccessor {
  @Input() opciones: any[] = [];
  @Input() placeholder: string = 'Seleccione una opción';
  @Input() propId: string = 'id';
  @Input() propNombre: string = 'nombre';
  @Input() disabled: boolean = false;
  @Input() esInvalido: boolean = false;
  @Input() claseAdicional: string = '';
  @Input() icono: string = '';

  private elemento = inject(ElementRef);
  
  valorActual: any = '';
  textoSeleccionado: string = '';
  desplegableAbierto: boolean = false;

  private onChange = (v: any) => {};
  private onTouched = () => {};

  ngOnInit() {
    this.actualizarTextoSeleccionado();
  }

  ngOnChanges() {
    this.actualizarTextoSeleccionado();
  }

  writeValue(valor: any): void {
    this.valorActual = valor;
    this.actualizarTextoSeleccionado();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  toggleDesplegable(): void {
    if (this.disabled) return;
    this.desplegableAbierto = !this.desplegableAbierto;
    if (this.desplegableAbierto) {
      this.onTouched();
    }
  }

  seleccionarOpcion(valor: any, event: Event): void {
    event.stopPropagation();
    this.valorActual = valor;
    this.onChange(this.valorActual);
    this.actualizarTextoSeleccionado();
    this.desplegableAbierto = false;
  }

  @HostListener('document:click', ['$event'])
  cerrarDesplegableAlHacerClicAfuera(event: Event): void {
    if (this.desplegableAbierto) {
      const clickDentro = this.elemento.nativeElement.contains(event.target as Node);
      if (!clickDentro) {
        this.desplegableAbierto = false;
      }
    }
  }

  private actualizarTextoSeleccionado(): void {
    if (this.valorActual === '' || this.valorActual === null || this.valorActual === undefined) {
      this.textoSeleccionado = this.placeholder;
      return;
    }
    const opcion = this.opciones.find(o => o[this.propId] === this.valorActual);
    this.textoSeleccionado = opcion ? opcion[this.propNombre] : this.placeholder;
  }
}
