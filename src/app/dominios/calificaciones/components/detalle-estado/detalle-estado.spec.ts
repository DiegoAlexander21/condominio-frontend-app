import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleEstadoComponent } from './detalle-estado';

describe('DetalleEstadoComponent', () => {
  let component: DetalleEstadoComponent;
  let fixture: ComponentFixture<DetalleEstadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleEstadoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleEstadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
