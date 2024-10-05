import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditExaminerComponent } from './edit-examiner.component';

describe('ExaminerRegistrationComponent', () => {
  let component: EditExaminerComponent;
  let fixture: ComponentFixture<EditExaminerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditExaminerComponent]
    });
    fixture = TestBed.createComponent(EditExaminerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
