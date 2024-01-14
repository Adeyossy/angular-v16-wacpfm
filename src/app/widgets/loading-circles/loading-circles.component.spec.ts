import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingCirclesComponent } from './loading-circles.component';

describe('LoadingCirclesComponent', () => {
  let component: LoadingCirclesComponent;
  let fixture: ComponentFixture<LoadingCirclesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoadingCirclesComponent]
    });
    fixture = TestBed.createComponent(LoadingCirclesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
