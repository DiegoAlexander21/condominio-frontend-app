import { IncidenciaFrecuenteResponse } from './incidencia-frecuente.interface';
import { AreaGastoResponse } from './area-gasto.interface';
import { UnidadMorosaResponse } from './unidad-morosa.interface';

export interface ReporteDashboardResponse {
  incidenciasFrecuentes: IncidenciaFrecuenteResponse[];
  areasConMayorGasto: AreaGastoResponse[];
  unidadesMorosas: UnidadMorosaResponse[];
  unidadesConMayorDeuda: UnidadMorosaResponse[];
}
