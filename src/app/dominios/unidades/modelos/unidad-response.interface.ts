export interface UnidadResponse {
  id: number;
  condominioId: number;
  nombreCondominio: string;
  numeroUnidad: string;
  torre: string;
  piso: number;
  area: number;
  estado: string;
  nombreMostrar?: string;
}
