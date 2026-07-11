export interface PaqueteForm {
  unidadId: number;
  remitente: string;
  destinatario: string;
  observacion?: string;
}

export interface RegistroEntregaPaqueteForm {
  paqueteId: number;
  fechaEntrega?: string;
  observacion?: string;
}
