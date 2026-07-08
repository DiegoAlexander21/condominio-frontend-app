export interface UsoInsumoForm {
  insumoId: number;
  cantidadUsada: number;
}

export interface TareaMantenimientoForm {
  areaComunId: number;
  descripcion: string;
  fechaProgramada: string;
  usosInsumos: UsoInsumoForm[];
}

export interface UsoInsumoResponse {
  id: number;
  nombreInsumo: string;
  cantidadUsada: number;
  unidadMedida: string;
  costoUnitario: number;
  subtotal: number;
}

export interface TareaMantenimientoResponse {
  id: number;
  nombreArea: string;
  descripcion: string;
  fechaProgramada: string;
  usosInsumos: UsoInsumoResponse[];
  costoTotal: number;
}
