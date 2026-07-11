import { EstadoPaquete } from './estado-paquete.enum';

export interface Paquete {
  id: number;
  unidadId: number;
  unidadNumero: string;
  unidadTorre: string;
  remitente: string;
  destinatario: string;
  estado: EstadoPaquete;
  fechaRecepcion: string;
  fechaEntrega?: string;
  observacion?: string;
}
