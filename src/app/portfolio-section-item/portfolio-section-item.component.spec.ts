import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioSectionItemComponent } from './portfolio-section-item.component';

describe('PortfolioSectionItemComponent', () => {
  let component: PortfolioSectionItemComponent;
  let fixture: ComponentFixture<PortfolioSectionItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PortfolioSectionItemComponent]
    });
    fixture = TestBed.createComponent(PortfolioSectionItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
