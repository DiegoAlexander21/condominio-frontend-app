import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioReservaComponent } from './formulario-reserva';

describe('FormularioReserva', () => {
  let component: FormularioReservaComponent;
  let fixture: ComponentFixture<FormularioReservaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioReservaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioReservaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
