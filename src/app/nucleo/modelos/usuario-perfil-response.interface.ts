export interface UsuarioPerfilResponse {
  nombres: string;
  apellidos: string;
  numeroDocumento: string;
  correo: string;
  rol: string;
  condominioId: number | null;
  unidadId: number | null;
  nombreCondominio?: string;
  torre?: string;
  piso?: number;
  numeroUnidad?: string;
}
