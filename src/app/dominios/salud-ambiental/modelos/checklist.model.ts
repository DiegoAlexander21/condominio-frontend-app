export interface ItemChecklistResponse {
  id: number;
  descripcion: string;
}

export interface ChecklistResponse {
  id: number;
  areaComunId: number;
  nombreArea: string;
  nombre: string;
  activo: boolean;
  fechaRegistro: string;
  items: ItemChecklistResponse[];
}

export interface ItemChecklistForm {
  descripcion: string;
}

export interface ChecklistForm {
  areaComunId: number;
  nombre: string;
  items: ItemChecklistForm[];
}
