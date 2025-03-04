import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExaminerProfileComponent } from './examiner-profile.component';

describe('ExaminerProfileComponent', () => {
  let component: ExaminerProfileComponent;
  let fixture: ComponentFixture<ExaminerProfileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExaminerProfileComponent]
    });
    fixture = TestBed.createComponent(ExaminerProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
