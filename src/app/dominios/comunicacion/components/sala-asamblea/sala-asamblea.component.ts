import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../../compartido/componentes/toast/toast.service';
import { ComunicacionService } from '../../services/comunicacion.service';
import { WebsocketService } from '../../services/websocket.service';
import { AsambleaResponse } from '../../modelos/asamblea.model';
import { ResultadoAsambleaResponse } from '../../modelos/votacion.model';
import { UsuarioService } from '../../../../nucleo/servicios/usuario.service';
import { Subscription } from 'rxjs';
import { ModalConfirmacionComponent } from '../../../../compartido/componentes/modal-confirmacion/modal-confirmacion';
import { UsuarioPerfilResponse } from '../../../../nucleo/modelos/usuario-perfil-response.interface';
import { EstadoAsamblea } from '../../modelos/estado-asamblea.enum';

@Component({
  selector: 'app-sala-asamblea',
  standalone: true,
  imports: [CommonModule, ModalConfirmacionComponent],
  templateUrl: './sala-asamblea.component.html',
  styleUrls: ['./sala-asamblea.component.scss']
})
export class SalaAsambleaComponent implements OnInit, OnDestroy {
  public EstadoAsamblea = EstadoAsamblea;
  
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private comunicacionService = inject(ComunicacionService);
  private websocketService = inject(WebsocketService);
  private usuarioService = inject(UsuarioService);
  private toastService = inject(ToastService);

  asambleaId: number = 0;
  asamblea: AsambleaResponse | null = null;
  resultados: ResultadoAsambleaResponse | null = null;
  perfil: UsuarioPerfilResponse | null = null;
  
  cargando = true;
  votando = false;
  yaVoto = false;
  mostrarModalTerminar = false;

  private wsSubscription: Subscription | null = null;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.asambleaId = Number(idParam);
      this.cargarDatos();
    } else {
      this.volver();
    }
  }

  ngOnDestroy(): void {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    this.websocketService.desconectar();
  }

  private cargarDatos(): void {
    this.cargando = true;
    this.usuarioService.obtenerMiPerfil().subscribe({
      next: (perfil) => {
        this.perfil = perfil;
        this.cargarAsamblea();
      },
      error: () => {
        this.toastService.mostrarError('Error al cargar perfil');
        this.volver();
      }
    });
  }

  private cargarAsamblea(): void {
    this.comunicacionService.obtenerAsambleaPorId(this.asambleaId).subscribe({
      next: (asamblea) => {
        this.asamblea = asamblea;
        
        if (this.esResidenteHabilitado() && this.perfil?.unidadId) {
          this.comunicacionService.verificarVoto(this.asambleaId, this.perfil.unidadId).subscribe({
            next: (res) => {
              this.yaVoto = res.votoRegistrado;
              this.cargarResultados();
              this.iniciarWebSocket();
            },
            error: () => {
              this.cargarResultados();
              this.iniciarWebSocket();
            }
          });
        } else {
          this.cargarResultados();
          this.iniciarWebSocket();
        }
      },
      error: () => {
        this.toastService.mostrarError('Asamblea no encontrada');
        this.volver();
      }
    });
  }

  cambiarVoto(): void {
    this.yaVoto = false;
  }

  private cargarResultados(): void {
    this.comunicacionService.obtenerResultadosVotacion(this.asambleaId).subscribe({
      next: (res) => {
        this.resultados = res;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  private iniciarWebSocket(): void {
    this.websocketService.conectar(this.asambleaId);
    this.wsSubscription = this.websocketService.obtenerActualizaciones().subscribe((res) => {
      this.resultados = res;
      if (this.asamblea && res.estado) {
        this.asamblea.estado = res.estado as EstadoAsamblea;
      }
    });
  }

  votar(opcionId: number): void {
    if (!this.perfil?.unidadId) {
      this.toastService.mostrarAdvertencia('Solo los residentes vinculados a una unidad pueden votar.');
      return;
    }

    if (this.asamblea?.estado !== EstadoAsamblea.ABIERTA) {
      this.toastService.mostrarAdvertencia('La votación está cerrada.');
      return;
    }

    this.votando = true;
    this.comunicacionService.registrarVoto({
      asambleaId: this.asambleaId,
      opcionId: opcionId,
      unidadId: this.perfil.unidadId
    }).subscribe({
      next: () => {
        this.toastService.mostrarExito('¡Tu voto ha sido registrado!');
        this.yaVoto = true;
        this.votando = false;
      },
      error: (err) => {
        this.toastService.mostrarError(err.error?.error || 'Error al emitir el voto');
        this.votando = false;
      }
    });
  }

  obtenerPorcentaje(votos: number): number {
    if (!this.resultados || this.resultados.totalVotos === 0) return 0;
    return (votos / this.resultados.totalVotos) * 100;
  }

  obtenerVotosOpcion(opcionId: number): number {
    if (!this.resultados) return 0;
    const opcion = this.resultados.resultados.find(r => r.opcionId === opcionId);
    return opcion ? opcion.votos : 0;
  }

  esResidenteHabilitado(): boolean {
    return this.perfil?.rol === 'RESIDENTE' && !!this.perfil?.unidadId;
  }

  esAdministrador(): boolean {
    return this.perfil?.rol === 'ADMINISTRADOR';
  }

  terminarAsamblea(): void {
    this.mostrarModalTerminar = true;
  }

  confirmarTerminarAsamblea(): void {
    this.mostrarModalTerminar = false;
    this.votando = true;
    this.comunicacionService.terminarAsamblea(this.asambleaId).subscribe({
      next: () => {
        this.toastService.mostrarExito('La asamblea ha sido terminada exitosamente.');
        this.votando = false;
        if (this.asamblea) {
          this.asamblea.estado = EstadoAsamblea.CERRADA;
        }
      },
      error: (err) => {
        this.toastService.mostrarError(err.error?.error || 'Error al terminar la asamblea');
        this.votando = false;
      }
    });
  }

  volver(): void {
    this.router.navigate(['/comunicacion/asambleas']);
  }
}
