import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {

  private httpClient = inject(HttpClient);
  private cloudName = 'dxciesoqh';
  private uploadPreset = 'condominio_preset';
  private url = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;

  subirImagen(archivo: File): Observable<{ secure_url: string }> {
    const formData = new FormData();
    formData.append('file', archivo);
    formData.append('upload_preset', this.uploadPreset);

    return this.httpClient.post<{ secure_url: string }>(this.url, formData);
  }
}
