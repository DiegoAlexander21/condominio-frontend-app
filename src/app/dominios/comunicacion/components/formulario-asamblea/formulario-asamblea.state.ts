import { Injectable, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CondominioResponse } from '../../../condominio/modelos/condominio-response.interface';
import { TorreDto } from '../../../unidades/modelos/torre.dto';
import { UnidadResponse } from '../../../unidades/modelos/unidad-response.interface';
import { CondominioService } from '../../../condominio/services/condominio.service';
import { UnidadService } from '../../../unidades/services/unidad';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';
import { AlcanceComunicado } from '../../modelos/alcance-comunicado.enum';

@Injectable()
export class FormularioAsambleaState {
  private condominioService = inject(CondominioService);
  private unidadService = inject(UnidadService);
  private toastService = inject(ToastService);

  formulario!: FormGroup;
  condominios: CondominioResponse[] = [];
  torresDisponibles: TorreDto[] = [];
  unidadesDisponibles: UnidadResponse[] = [];

  vincularFormulario(formulario: FormGroup): void {
    this.formulario = formulario;
  }

  cargarCondominios(): void {
    this.condominioService.obtenerListaCondominios(0, 1000).subscribe({
      next: (res) => this.condominios = res.contenido,
      error: () => this.toastService.mostrarError('Error al cargar condominios.')
    });
  }

  alCambiarAlcance(): void {
    const alcance = this.formulario.get('alcance')?.value;
    if (alcance === AlcanceComunicado.GLOBAL) {
      this.formulario.get('torres')?.setValue([]);
      this.formulario.get('unidadIds')?.setValue([]);
    }
  }

  alCambiarCondominios(): void {
    const seleccionados = this.formulario.get('condominioIds')?.value || [];
    this.formulario.get('torres')?.setValue([]);
    this.formulario.get('unidadIds')?.setValue([]);
    this.torresDisponibles = [];
    this.unidadesDisponibles = [];

    if (seleccionados.length > 0) {
      this.unidadService.buscarTorresMultiples(seleccionados).subscribe({
        next: (torres) => this.torresDisponibles = torres,
        error: () => this.toastService.mostrarError('Error al cargar torres.')
      });
    }
  }

  alCambiarTorres(): void {
    const torresStr: string[] = this.formulario.get('torres')?.value || [];
    this.formulario.get('unidadIds')?.setValue([]);
    this.unidadesDisponibles = [];

    if (torresStr.length > 0) {
      const torresReconstruidas: TorreDto[] = torresStr.map(str => {
        const [cid, t] = str.split('_');
        return { condominioId: Number(cid), torre: t };
      });

      this.unidadService.buscarViviendasMultiples(torresReconstruidas).subscribe({
        next: (unidades) => this.unidadesDisponibles = unidades,
        error: () => this.toastService.mostrarError('Error al cargar viviendas.')
      });
    }
  }

  alternarCondominio(id: number): void {
    const arr = this.formulario.get('condominioIds')?.value as number[] || [];
    const index = arr.indexOf(id);
    if (index === -1) arr.push(id);
    else arr.splice(index, 1);
    this.formulario.get('condominioIds')?.setValue([...arr]);
    this.alCambiarCondominios();
  }

  esCondominioSeleccionado(id: number): boolean {
    return (this.formulario.get('condominioIds')?.value as number[] || []).includes(id);
  }

  seleccionarTodosCondominios(): void {
    const todos = this.condominios.map(c => c.id);
    this.formulario.get('condominioIds')?.setValue(todos);
    this.alCambiarCondominios();
  }

  deseleccionarTodosCondominios(): void {
    this.formulario.get('condominioIds')?.setValue([]);
    this.alCambiarCondominios();
  }

  alternarTorre(torre: TorreDto): void {
    const arr = this.formulario.get('torres')?.value as string[] || [];
    const str = `${torre.condominioId}_${torre.torre}`;
    const index = arr.indexOf(str);
    if (index === -1) arr.push(str);
    else arr.splice(index, 1);
    this.formulario.get('torres')?.setValue([...arr]);
    this.alCambiarTorres();
  }

  esTorreSeleccionada(torre: TorreDto): boolean {
    const str = `${torre.condominioId}_${torre.torre}`;
    return (this.formulario.get('torres')?.value as string[] || []).includes(str);
  }

  seleccionarTodasTorres(): void {
    const todas = this.torresDisponibles.map(t => `${t.condominioId}_${t.torre}`);
    this.formulario.get('torres')?.setValue(todas);
    this.alCambiarTorres();
  }

  deseleccionarTodasTorres(): void {
    this.formulario.get('torres')?.setValue([]);
    this.alCambiarTorres();
  }

  alternarVivienda(id: number): void {
    const arr = this.formulario.get('unidadIds')?.value as number[] || [];
    const index = arr.indexOf(id);
    if (index === -1) arr.push(id);
    else arr.splice(index, 1);
    this.formulario.get('unidadIds')?.setValue([...arr]);
  }

  esViviendaSeleccionada(id: number): boolean {
    return (this.formulario.get('unidadIds')?.value as number[] || []).includes(id);
  }

  seleccionarTodasViviendas(): void {
    const todas = this.unidadesDisponibles.map(u => u.id);
    this.formulario.get('unidadIds')?.setValue(todas);
  }

  deseleccionarTodasViviendas(): void {
    this.formulario.get('unidadIds')?.setValue([]);
  }
}
