import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateCourseDetailsComponent } from './update-course-details.component';

describe('UpdateCourseDetailsComponent', () => {
  let component: UpdateCourseDetailsComponent;
  let fixture: ComponentFixture<UpdateCourseDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UpdateCourseDetailsComponent]
    });
    fixture = TestBed.createComponent(UpdateCourseDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
