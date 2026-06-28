import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionPagosComponent } from './gestion-pagos';

describe('GestionPagosComponent', () => {
  let component: GestionPagosComponent;
  let fixture: ComponentFixture<GestionPagosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionPagosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionPagosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
