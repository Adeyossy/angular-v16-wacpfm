import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioSubsectionComponent } from './portfolio-subsection.component';

describe('PortfolioSubsectionComponent', () => {
  let component: PortfolioSubsectionComponent;
  let fixture: ComponentFixture<PortfolioSubsectionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PortfolioSubsectionComponent]
    });
    fixture = TestBed.createComponent(PortfolioSubsectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
