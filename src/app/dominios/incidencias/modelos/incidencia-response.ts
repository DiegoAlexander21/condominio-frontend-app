export interface IncidenciaResponse {
    id: number;
    areaComunId?: number;
    unidadId?: number;
    descripcion: string;
    gravedad: string;
    causa: string;
    estado: string;
    responsableAtencion?: string;
    fechaReporte: string;
    fechaActualizacion?: string;
    lugarAfectado: string;
    condominioId?: number;
    torre?: string;
    gravedadFormateada?: string;
    causaFormateada?: string;
    estadoFormateado?: string;
}
export enum GravedadIncidencia {
    LEVE = 'LEVE',
    MODERADO = 'MODERADO',
    GRAVE = 'GRAVE',
    CRITICO = 'CRITICO'
}

export enum CausaIncidencia {
    DESGASTE = 'DESGASTE',
    MAL_USO = 'MAL_USO',
    CLIMA = 'CLIMA',
    VANDALISMO = 'VANDALISMO'
}

export enum EstadoIncidencia {
    REGISTRADO = 'REGISTRADO',
    EN_REVISION = 'EN_REVISION',
    EN_ATENCION = 'EN_ATENCION',
    RESUELTO = 'RESUELTO'
}
