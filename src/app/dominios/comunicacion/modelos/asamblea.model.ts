import { EstadoAsamblea } from './estado-asamblea.enum';
import { AlcanceComunicado } from './alcance-comunicado.enum';
import { OpcionVotacionResponse } from './votacion.model';
import { ComunicadoTorreDto } from './comunicado.model';

export interface AsambleaResponse {
  id: number;
  condominioIds: number[];
  alcance: AlcanceComunicado;
  torres: ComunicadoTorreDto[];
  unidadIds: number[];
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  estado: EstadoAsamblea;
  opciones: OpcionVotacionResponse[];
}

export interface AsambleaForm {
  condominioIds: number[];
  alcance: AlcanceComunicado;
  torres?: ComunicadoTorreDto[];
  unidadIds?: number[];
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  opciones: string[];
}
