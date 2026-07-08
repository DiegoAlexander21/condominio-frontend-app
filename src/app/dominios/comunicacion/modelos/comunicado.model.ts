import { AlcanceComunicado } from './alcance-comunicado.enum';

export interface ComunicadoTorreDto {
  condominioId: number;
  torre: string;
}

export interface ComunicadoResponse {
  id: number;
  alcance: AlcanceComunicado;
  condominioIds: number[];
  torres: ComunicadoTorreDto[];
  unidadIds: number[];
  titulo: string;
  contenido: string;
  fechaPublicacion: string;
}

export interface ComunicadoForm {
  alcance: AlcanceComunicado;
  condominioIds: number[];
  torres: ComunicadoTorreDto[];
  unidadIds: number[];
  titulo: string;
  contenido: string;
}

export interface ComunicadoIAForm {
  alcance: AlcanceComunicado;
  condominioIds: number[];
  torres: ComunicadoTorreDto[];
  unidadIds: number[];
  titulo: string;
  borrador: string;
}
