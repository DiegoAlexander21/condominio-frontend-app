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
export class SelectPersonalizadoComponent<T> implements ControlValueAccessor {
  @Input() opciones: T[] = [];
  @Input() placeholder: string = 'Seleccione una opción';
  @Input() propId: string = 'id';
  @Input() propNombre: string = 'nombre';
  @Input() disabled: boolean = false;
  @Input() esInvalido: boolean = false;
  @Input() claseAdicional: string = '';
  @Input() icono: string = '';

  private elemento = inject(ElementRef);
  
  valorActual: string | number | null = '';
  textoSeleccionado: string = '';
  desplegableAbierto: boolean = false;

  private onChange = (v: string | number | null) => {};
  private onTouched = () => {};

  ngOnInit() {
    this.actualizarTextoSeleccionado();
  }

  ngOnChanges() {
    this.actualizarTextoSeleccionado();
  }

  writeValue(valor: string | number | null): void {
    this.valorActual = valor;
    this.actualizarTextoSeleccionado();
  }

  registerOnChange(fn: (valor: string | number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
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

  seleccionarOpcion(valor: string | number | null, event: Event): void {
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

  obtenerValorPropiedad(opcion: T, prop: string): string | number | null {
    const valor = (opcion as Record<string, unknown>)[prop];
    if (valor === null || typeof valor === 'string' || typeof valor === 'number') {
      return valor;
    }
    if (valor === undefined) {
      return null;
    }
    return String(valor);
  }

  private actualizarTextoSeleccionado(): void {
    if (this.valorActual === '' || this.valorActual === null || this.valorActual === undefined) {
      this.textoSeleccionado = this.placeholder;
      return;
    }
    const opcion = this.opciones.find(o => this.obtenerValorPropiedad(o, this.propId) === this.valorActual);
    this.textoSeleccionado = opcion ? String(this.obtenerValorPropiedad(opcion, this.propNombre)) : this.placeholder;
  }

  get tieneOpcionVaciaEnLista(): boolean {
    return this.opciones.some(o => {
      const v = this.obtenerValorPropiedad(o, this.propId);
      return v === '' || v === null;
    });
  }
}
