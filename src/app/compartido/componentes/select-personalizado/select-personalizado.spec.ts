import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectPersonalizadoComponent } from './select-personalizado';

describe('SelectPersonalizadoComponent', () => {
  let component: SelectPersonalizadoComponent;
  let fixture: ComponentFixture<SelectPersonalizadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectPersonalizadoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectPersonalizadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
