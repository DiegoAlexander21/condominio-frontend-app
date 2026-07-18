import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Observable, Subject } from 'rxjs';
import { ResultadoAsambleaResponse } from '../modelos/votacion.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private clienteStomp: Client;
  private resultadosSubject = new Subject<ResultadoAsambleaResponse>();

  constructor() {
    this.clienteStomp = new Client({
      webSocketFactory: () => new SockJS(`${environment.wsUrl}`),
      reconnectDelay: 5000,
      debug: (msg: string) => {
      }
    });
  }

  conectar(asambleaId: number): void {
    if (this.clienteStomp.active) {
      this.suscribirseAAsamblea(asambleaId);
      return;
    }

    this.clienteStomp.onConnect = () => {
      this.suscribirseAAsamblea(asambleaId);
    };

    this.clienteStomp.activate();
  }

  desconectar(): void {
    if (this.clienteStomp.active) {
      this.clienteStomp.deactivate();
    }
  }

  private suscribirseAAsamblea(asambleaId: number): void {
    this.clienteStomp.subscribe(`/topic/asambleas/${asambleaId}`, (mensaje: IMessage) => {
      if (mensaje.body) {
        const resultado: ResultadoAsambleaResponse = JSON.parse(mensaje.body);
        this.resultadosSubject.next(resultado);
      }
    });
  }

  obtenerActualizaciones(): Observable<ResultadoAsambleaResponse> {
    return this.resultadosSubject.asObservable();
  }
}
