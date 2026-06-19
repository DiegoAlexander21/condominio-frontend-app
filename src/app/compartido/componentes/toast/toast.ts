import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, MensajeToast } from './toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrls: ['./toast.scss']
})
export class ToastComponent implements OnInit, OnDestroy {
  private toastServicio = inject(ToastService);
  private subscripcion: Subscription | null = null;
  
  mensajeActual: MensajeToast | null = null;
  visible = false;
  
  private timeoutId: any;

  ngOnInit(): void {
    this.subscripcion = this.toastServicio.toast$.subscribe(mensaje => {
      this.mostrar(mensaje);
    });
  }

  ngOnDestroy(): void {
    if (this.subscripcion) {
      this.subscripcion.unsubscribe();
    }
  }

  private mostrar(mensaje: MensajeToast): void {
    this.mensajeActual = mensaje;
    this.visible = true;

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      this.visible = false;
      setTimeout(() => {
        this.mensajeActual = null;
      }, 300);
    }, 3000);
  }
}
