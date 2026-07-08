import { EstadoAsamblea } from './estado-asamblea.enum';
import { OpcionVotacionResponse } from './votacion.model';

export interface AsambleaResponse {
  id: number;
  condominioId: number;
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  estado: EstadoAsamblea;
  opciones: OpcionVotacionResponse[];
}

export interface AsambleaForm {
  condominioId: number;
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  opciones: string[];
}
