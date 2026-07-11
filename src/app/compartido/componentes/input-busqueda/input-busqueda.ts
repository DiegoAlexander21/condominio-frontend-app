import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-busqueda',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './input-busqueda.html',
  styleUrls: ['./input-busqueda.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputBusquedaComponent),
      multi: true
    }
  ]
})
export class InputBusquedaComponent implements ControlValueAccessor {
  @Input() placeholder: string = 'Buscar...';
  
  valor: string = '';
  disabled: boolean = false;

  private onChange = (valor: string) => {};
  private onTouched = () => {};

  writeValue(valor: string): void {
    this.valor = valor || '';
  }

  registerOnChange(fn: (valor: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  alCambiar(evento: Event): void {
    const nuevoValor = (evento.target as HTMLInputElement).value;
    this.valor = nuevoValor;
    this.onChange(this.valor);
  }

  alTocar(): void {
    this.onTouched();
  }
}
