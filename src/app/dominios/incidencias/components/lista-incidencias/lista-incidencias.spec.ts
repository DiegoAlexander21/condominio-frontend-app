import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaIncidencias } from './lista-incidencias';

describe('ListaIncidencias', () => {
  let component: ListaIncidencias;
  let fixture: ComponentFixture<ListaIncidencias>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaIncidencias]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaIncidencias);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
