export interface RespuestaPaginada<T> {
  contenido: T[];
  paginaActual: number;
  totalPaginas: number;
  totalElementos: number;
  ultimaPagina: boolean;
}
