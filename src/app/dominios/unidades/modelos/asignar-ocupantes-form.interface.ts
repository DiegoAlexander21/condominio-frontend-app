export interface AsignarOcupantesForm {
  id?: number;
  nombrePropietario: string;
  dniPropietario: string;
  emailPropietario: string;
  telefonoPropietario: string;
  nombreResidente: string;
  emailResidente: string;
  dniResidente: string;
  parentesco: string;
  residenteActivo: boolean;
}
