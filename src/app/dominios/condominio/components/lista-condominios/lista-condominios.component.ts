import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CondominioService } from '../../services/condominio.service';
import { Condominio } from '../../models/condominio.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-lista-condominios',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './lista-condominios.component.html',
  styleUrls: ['./lista-condominios.component.scss']
})
export class ListaCondominiosComponent implements OnInit {
  private condominioServicio = inject(CondominioService);
  
  listaCondominios$: Observable<Condominio[]> | undefined;

  ngOnInit(): void {
    this.obtenerDatos();
  }

  obtenerDatos(): void {
    this.listaCondominios$ = this.condominioServicio.obtenerListaCondominios();
  }
}
