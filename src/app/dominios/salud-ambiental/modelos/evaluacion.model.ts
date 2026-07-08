export enum ResultadoChecklist {
  PASA = 'PASA',
  NO_PASA = 'NO_PASA'
}

export interface EvaluacionResponse {
  id: number;
  nombreChecklist: string;
  nombreArea: string;
  fechaEvaluacion: string;
  resultado: string;
  observacion: string;
  alertaGenerada: boolean;
}

export interface EvaluacionForm {
  checklistId: number;
  resultado: string;
  observacion: string;
}
