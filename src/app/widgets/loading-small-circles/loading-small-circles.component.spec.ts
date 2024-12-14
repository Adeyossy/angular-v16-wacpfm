import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingSmallCirclesComponent } from './loading-small-circles.component';

describe('LoadingSmallCirclesComponent', () => {
  let component: LoadingSmallCirclesComponent;
  let fixture: ComponentFixture<LoadingSmallCirclesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoadingSmallCirclesComponent]
    });
    fixture = TestBed.createComponent(LoadingSmallCirclesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
