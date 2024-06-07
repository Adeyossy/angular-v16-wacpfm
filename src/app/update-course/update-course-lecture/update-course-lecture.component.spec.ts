import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateCourseLectureComponent } from './update-course-lecture.component';

describe('UpdateCourseLectureComponent', () => {
  let component: UpdateCourseLectureComponent;
  let fixture: ComponentFixture<UpdateCourseLectureComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UpdateCourseLectureComponent]
    });
    fixture = TestBed.createComponent(UpdateCourseLectureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
