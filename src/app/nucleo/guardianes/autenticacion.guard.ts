import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AutenticacionService } from '../servicios/autenticacion.service';

export const autenticacionGuard: CanActivateFn = () => {
  const servicioAutenticacion = inject(AutenticacionService);
  const enrutador = inject(Router);

  if (servicioAutenticacion.estaAutenticado()) {
    return true;
  }

  enrutador.navigate(['/login']);
  return false;
};
