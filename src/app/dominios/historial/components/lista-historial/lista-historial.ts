import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { HistorialService } from '../../services/historial';
import { HistorialTitularidadResponse } from '../../modelos/historial-response';
import { RespuestaPaginada } from '../../../../compartido/modelos/respuesta-paginada.interface';
import { PaginacionComponent } from '../../../../compartido/componentes/paginacion/paginacion';


@Component({
  selector: 'app-lista-historial',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PaginacionComponent],
  templateUrl: './lista-historial.html',
  styleUrls: ['./lista-historial.scss']
})
export class ListaHistorialComponent implements OnInit {
  private historialServicio = inject(HistorialService);
  private constructorFormulario = inject(FormBuilder);

  respuestaPaginada$: Observable<RespuestaPaginada<HistorialTitularidadResponse>> | undefined;
  paginaActual = 0;
  tamanoPagina = 9;
  
  formularioBusqueda: FormGroup = this.constructorFormulario.group({
    termino: ['']
  });

  ngOnInit(): void {
    this.obtenerDatos();
    
    this.formularioBusqueda.get('termino')?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => {
      this.paginaActual = 0;
      this.obtenerDatos();
    });
  }

  obtenerDatos(): void {
    const termino = this.formularioBusqueda.get('termino')?.value;
    this.respuestaPaginada$ = this.historialServicio.obtenerListaHistorial(this.paginaActual, this.tamanoPagina, termino).pipe(
      catchError(error => {
        console.error(error);
        return of({
          contenido: [],
          paginaActual: 0,
          totalElementos: 0,
          totalPaginas: 0,
          ultimaPagina: true
        });
      })
    );
  }

  cambiarPagina(nuevaPagina: number): void {
    this.paginaActual = nuevaPagina;
    this.obtenerDatos();
  }
}
