import { Component, Input, forwardRef, ElementRef, HostListener, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-calendario-personalizado',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendario-personalizado.html',
  styleUrls: ['./calendario-personalizado.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CalendarioPersonalizadoComponent),
      multi: true
    }
  ]
})
export class CalendarioPersonalizadoComponent implements ControlValueAccessor, OnInit {
  @Input() placeholder: string = 'Seleccione una fecha';
  @Input() disabled: boolean = false;
  @Input() esInvalido: boolean = false;
  @Input() claseAdicional: string = '';

  valorActual: string = '';
  textoSeleccionado: string = '';
  desplegableAbierto: boolean = false;

  mesActual: number = new Date().getMonth();
  anioActual: number = new Date().getFullYear();
  diasMes: number[] = [];
  espaciosVacios: number[] = [];
  
  nombresDias = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];
  nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  private elemento = inject(ElementRef);
  private onChange = (valor: string) => {};
  private onTouched = () => {};

  ngOnInit() {
    this.actualizarTextoSeleccionado();
    this.generarCalendario(this.mesActual, this.anioActual);
  }

  writeValue(valor: string): void {
    this.valorActual = valor || '';
    if (this.valorActual) {
      const [year, month, day] = this.valorActual.split('-');
      this.anioActual = parseInt(year, 10);
      this.mesActual = parseInt(month, 10) - 1;
      this.generarCalendario(this.mesActual, this.anioActual);
    }
    this.actualizarTextoSeleccionado();
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

  toggleDesplegable(): void {
    if (this.disabled) return;
    this.desplegableAbierto = !this.desplegableAbierto;
    if (this.desplegableAbierto) {
      this.onTouched();
      
      if (this.valorActual) {
        const [year, month] = this.valorActual.split('-');
        this.anioActual = parseInt(year, 10);
        this.mesActual = parseInt(month, 10) - 1;
      } else {
        const hoy = new Date();
        this.anioActual = hoy.getFullYear();
        this.mesActual = hoy.getMonth();
      }
      this.generarCalendario(this.mesActual, this.anioActual);
    }
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

  generarCalendario(mes: number, anio: number) {
    const primerDia = new Date(anio, mes, 1).getDay();
    const diasEnMes = new Date(anio, mes + 1, 0).getDate();
    
    this.espaciosVacios = Array(primerDia).fill(0);
    this.diasMes = Array.from({length: diasEnMes}, (_, i) => i + 1);
  }

  cambiarMes(direccion: number, event: Event) {
    event.stopPropagation();
    this.mesActual += direccion;
    if (this.mesActual < 0) {
      this.mesActual = 11;
      this.anioActual--;
    } else if (this.mesActual > 11) {
      this.mesActual = 0;
      this.anioActual++;
    }
    this.generarCalendario(this.mesActual, this.anioActual);
  }

  seleccionarDia(dia: number, event: Event) {
    event.stopPropagation();
    const mesStr = (this.mesActual + 1).toString().padStart(2, '0');
    const diaStr = dia.toString().padStart(2, '0');
    this.valorActual = `${this.anioActual}-${mesStr}-${diaStr}`;
    
    this.onChange(this.valorActual);
    this.actualizarTextoSeleccionado();
    this.desplegableAbierto = false;
  }

  esDiaSeleccionado(dia: number): boolean {
    if (!this.valorActual) return false;
    const [year, month, d] = this.valorActual.split('-');
    return this.anioActual === parseInt(year, 10) && 
           this.mesActual === parseInt(month, 10) - 1 && 
           dia === parseInt(d, 10);
  }

  private actualizarTextoSeleccionado(): void {
    if (!this.valorActual) {
      this.textoSeleccionado = this.placeholder;
      return;
    }
    const [year, month, day] = this.valorActual.split('-');
    if (!year || !month || !day) {
      this.textoSeleccionado = this.placeholder;
      return;
    }
    this.textoSeleccionado = `${day}/${month}/${year}`;
  }
}
