import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnidadMorosaResponse } from '../../modelos/unidad-morosa.interface';

@Component({
  selector: 'app-lista-morosas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-morosas.html',
  styleUrls: ['./lista-morosas.scss']
})
export class ListaMorosasComponent {
  @Input() unidades: UnidadMorosaResponse[] = [];
}
