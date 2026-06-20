import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaHistorial } from './lista-historial';

describe('ListaHistorial', () => {
  let component: ListaHistorial;
  let fixture: ComponentFixture<ListaHistorial>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaHistorial]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaHistorial);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
