export interface CalificacionResponse {
  id: number;
  nombreArea: string;
  unidadIdentificador: string;
  puntaje: number;
  comentario: string;
  fechaRegistro: string;
}

export interface EstadoAreaResponse {
  id: number;
  areaId: number;
  condominioId: number;
  condominioNombre: string;
  nombreArea: string;
  calificacionPromedio: number;
  totalIncidencias: number;
  totalChecklistsNoAprobados: number;
  fechaCalculo: string;
}

export interface CalificacionForm {
  areaComunId: number;
  unidadId: number;
  puntaje: number;
  comentario: string;
}

export interface RespuestaDetalleArea {
  calificaciones: CalificacionResponse[];
  estadoActual: EstadoAreaResponse;
}
