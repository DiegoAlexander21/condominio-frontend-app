export interface InsumoResponse {
  id: number;
  nombre: string;
  unidadMedida: string;
  stockActual: number;
  stockMinimo: number;
  precioUnitario: number;
  fechaActualizacion: string;
}

export interface InsumoForm {
  nombre: string;
  unidadMedida: string;
  stockActual: number;
  stockMinimo: number;
  precioUnitario: number;
}
