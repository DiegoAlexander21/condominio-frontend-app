import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalificarAreaComponent } from './calificar-area';

describe('CalificarAreaComponent', () => {
  let component: CalificarAreaComponent;
  let fixture: ComponentFixture<CalificarAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalificarAreaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalificarAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
