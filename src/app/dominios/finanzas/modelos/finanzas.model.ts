export interface PaginaResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface GastoResponse {
  id: number;
  descripcion: string;
  tipoGasto: 'FIJO' | 'EXTRAORDINARIO';
  metodoDistribucion: 'PARTES_IGUALES' | 'COEFICIENTE_TAMANO' | 'COBRO_DIRECTO';
  incidenciaId: number | null;
  montoTotal: number;
  fechaRegistro: string;
  fechaLimite: string | null;
  condominioId: number;
  condominioNombre: string;
  torre: string | null;
  unidadIdCausante?: number | null;
  nombreUnidadCausante?: string | null;
  distribuido: boolean;
}

export interface GastoForm {
  id?: number;
  descripcion: string;
  tipoGasto: 'FIJO' | 'EXTRAORDINARIO';
  metodoDistribucion: 'PARTES_IGUALES' | 'COEFICIENTE_TAMANO' | 'COBRO_DIRECTO';
  montoTotal: number;
  fechaLimite?: string;
  incidenciaId?: number;
  condominioId: number;
  torre?: string;
}

export interface DistribucionGastoForm {
  gastoId: number;
  unidadId?: number;
}

export interface DetalleGastoUnidadResponse {
  id: number;
  gastoId: number;
  unidadId: number;
  descripcionGasto: string;
  tipoGasto: string;
  montoAsignado: number;
  fechaRegistro: string;
  fechaLimite: string | null;
}

export interface EstadoCuentaResponse {
  id: number;
  unidadId: number;
  unidadDetalles: string;
  periodo: string;
  totalCuotas: number;
  totalExtraordinarios: number;
  totalPagado: number;
  saldo: number;
  fechaVencimiento: string;
  fechaGeneracion: string;
}

export interface EstadoCuentaForm {
  unidadId: number;
  periodo: string;
}

export interface PagoResponse {
  id: number;
  unidadId: number;
  unidadDetalles: string;
  estadoCuentaId: number | null;
  monto: number;
  fechaPago: string;
  observacion: string;
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  evidencias: EvidenciaPagoResponse[];
}

export interface PagoForm {
  unidadId: number;
  estadoCuentaId?: number;
  monto: number;
  observacion?: string;
  evidenciaUrl?: string;
}

export interface EvidenciaPagoResponse {
  id: number;
  pagoId: number;
  urlArchivo: string;
  fechaRegistro: string;
}

export interface AprobacionPagoForm {
  aprobar: boolean;
  observacionAdmin?: string;
}
