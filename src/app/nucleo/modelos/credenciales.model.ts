export interface Credenciales {
  identificador: string;
  contrasena: string;
}

export interface RespuestaAutenticacion {
  tokenAcceso: string;
}

export enum TipoDocumento {
  DNI = 'DNI',
  CE = 'CE',
  PASAPORTE = 'PASAPORTE'
}

export enum NombreRol {
  ADMINISTRADOR = 'ADMINISTRADOR',
  PROPIETARIO = 'PROPIETARIO',
  RESIDENTE = 'RESIDENTE',
  CONSERJERIA = 'CONSERJERIA'
}

export interface RegistroUsuario {
  nombres: string;
  apellidos: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  telefono: string;
  correo: string;
  contrasena: string;
  rol: NombreRol;
}