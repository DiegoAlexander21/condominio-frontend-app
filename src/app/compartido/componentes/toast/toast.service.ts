import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface MensajeToast {
  texto: string;
  tipo: 'exito' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new Subject<MensajeToast>();
  toast$ = this.toastSubject.asObservable();

  mostrarExito(mensaje: string): void {
    this.toastSubject.next({ texto: mensaje, tipo: 'exito' });
  }

  mostrarError(mensaje: string): void {
    this.toastSubject.next({ texto: mensaje, tipo: 'error' });
  }
}
