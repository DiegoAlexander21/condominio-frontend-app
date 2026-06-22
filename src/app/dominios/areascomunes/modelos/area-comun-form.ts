export interface AreaComunForm {
  id?: number | null;
  condominioId: number;
  nombre: string;
  capacidad: number;
  horaInicio: string;
  horaFin: string;
  normasUso?: string | null;
}
