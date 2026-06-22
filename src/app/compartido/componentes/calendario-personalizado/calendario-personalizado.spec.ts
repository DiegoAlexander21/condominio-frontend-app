import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarioPersonalizadoComponent } from './calendario-personalizado';

describe('CalendarioPersonalizadoComponent', () => {
  let component: CalendarioPersonalizadoComponent;
  let fixture: ComponentFixture<CalendarioPersonalizadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarioPersonalizadoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarioPersonalizadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
