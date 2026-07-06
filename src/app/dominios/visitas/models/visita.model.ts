export enum EstadoVisita {
  PRE_REGISTRADA = 'PRE_REGISTRADA',
  INGRESO_REGISTRADO = 'INGRESO_REGISTRADO',
  SALIDA_REGISTRADA = 'SALIDA_REGISTRADA',
  CANCELADA = 'CANCELADA'
}

export interface VisitaResponse {
  id: number;
  unidadId: number;
  nombreVisitante: string;
  documentoVisitante: string;
  fechaVisitaProgramada: string;
  fechaIngreso: string | null;
  fechaSalida: string | null;
  estado: EstadoVisita;
  fechaRegistro: string;
}

export interface VisitaForm {
  unidadId: number;
  nombreVisitante: string;
  documentoVisitante: string;
  fechaVisitaProgramada: string;
}

export interface RegistroIngresoVisitaForm {
  visitaId: number;
  fechaIngreso?: string;
}

export interface RegistroSalidaVisitaForm {
  visitaId: number;
  fechaSalida?: string;
}
