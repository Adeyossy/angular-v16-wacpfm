import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateCoursePaymentComponent } from './update-course-payment.component';

describe('UpdateCoursePaymentComponent', () => {
  let component: UpdateCoursePaymentComponent;
  let fixture: ComponentFixture<UpdateCoursePaymentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UpdateCoursePaymentComponent]
    });
    fixture = TestBed.createComponent(UpdateCoursePaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
