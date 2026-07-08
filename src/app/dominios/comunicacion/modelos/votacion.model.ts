export interface OpcionVotacionResponse {
  id: number;
  texto: string;
}

export interface OpcionResultadoResponse {
  opcionId: number;
  texto: string;
  votos: number;
}

export interface ResultadoAsambleaResponse {
  asambleaId: number;
  totalVotos: number;
  estado: string;
  resultados: OpcionResultadoResponse[];
}

export interface VotoAsambleaForm {
  asambleaId: number;
  opcionId: number;
  unidadId: number;
}
