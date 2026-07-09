import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RankingAreasComponent } from './ranking-areas';

describe('RankingAreasComponent', () => {
  let component: RankingAreasComponent;
  let fixture: ComponentFixture<RankingAreasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RankingAreasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RankingAreasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
