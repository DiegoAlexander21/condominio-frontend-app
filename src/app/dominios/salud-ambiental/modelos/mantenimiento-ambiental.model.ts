export interface MantenimientoAmbientalResponse {
  id: number;
  nombreArea: string;
  descripcion: string;
  fechaRegistro: string;
  responsable: string;
}

export interface MantenimientoAmbientalForm {
  areaComunId: number;
  descripcion: string;
  responsable: string;
}
