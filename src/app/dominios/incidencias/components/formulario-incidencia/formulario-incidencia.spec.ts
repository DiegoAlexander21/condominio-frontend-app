import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioIncidencia } from './formulario-incidencia';

describe('FormularioIncidencia', () => {
  let component: FormularioIncidencia;
  let fixture: ComponentFixture<FormularioIncidencia>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioIncidencia]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioIncidencia);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
