import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AutenticacionService } from '../servicios/autenticacion.service';

export const rolGuard: CanActivateFn = (route) => {
  const servicioAutenticacion = inject(AutenticacionService);
  const enrutador = inject(Router);

  const rolesPermitidos = route.data['roles'] as string[];
  const rolesUsuario = servicioAutenticacion.obtenerRoles();

  if (!rolesPermitidos || rolesPermitidos.length === 0) {
    return true;
  }

  const tieneAcceso = rolesPermitidos.some(rol => rolesUsuario.includes(rol));

  if (tieneAcceso) {
    return true;
  }
  enrutador.navigate(['/condominios']);
  return false;
};
