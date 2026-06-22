export interface IncidenciaForm {
    condominioId: number;
    areaComunId?: number;
    unidadId?: number;
    descripcion: string;
    gravedad: string;
    causa: string;
    evidenciaUrl?: string;
}

export interface ActualizacionIncidenciaForm {
    incidenciaId?: number;
    estado: string;
    responsableAtencion?: string;
}
