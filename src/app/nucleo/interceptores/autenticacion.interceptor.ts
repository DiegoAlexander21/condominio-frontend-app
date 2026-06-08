import { HttpInterceptorFn } from '@angular/common/http';

export const autenticacionInterceptor: HttpInterceptorFn = (peticion, siguiente) => {
  const token = localStorage.getItem('token');

  if (token) {
    const peticionClonada = peticion.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return siguiente(peticionClonada);
  }

  return siguiente(peticion);
};
