import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AutenticacionService } from '../servicios/autenticacion.service';

export const autenticacionInterceptor: HttpInterceptorFn = (peticion, siguiente) => {
  const autenticacionService = inject(AutenticacionService);
  const token = autenticacionService.obtenerToken();

  if (token && !peticion.url.includes('api.cloudinary.com')) {
    const peticionClonada = peticion.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return siguiente(peticionClonada);
  }

  return siguiente(peticion);
};
