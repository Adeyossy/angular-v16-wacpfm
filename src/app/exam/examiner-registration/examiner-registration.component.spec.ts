import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExaminerRegistrationComponent } from './examiner-registration.component';

describe('ExaminerRegistrationComponent', () => {
  let component: ExaminerRegistrationComponent;
  let fixture: ComponentFixture<ExaminerRegistrationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExaminerRegistrationComponent]
    });
    fixture = TestBed.createComponent(ExaminerRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
