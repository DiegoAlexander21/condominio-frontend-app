import { IncidenciaFrecuenteResponse } from './incidencia-frecuente.interface';
import { EstadoAreaResponse } from '../../calificaciones/modelos/calificacion.model';
import { AreaGastoResponse } from './area-gasto.interface';
import { UnidadMorosaResponse } from './unidad-morosa.interface';

export interface ReporteDashboardResponse {
  incidenciasFrecuentes: IncidenciaFrecuenteResponse[];
  areasConMayorGasto: AreaGastoResponse[];
  unidadesMorosas: UnidadMorosaResponse[];
  unidadesConMayorDeuda: UnidadMorosaResponse[];
  rankingAreas: EstadoAreaResponse[];
}
