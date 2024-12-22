import { TestBed } from '@angular/core/testing';

import { UpdateCourseService } from './update-course.service';

describe('UpdateCourseService', () => {
  let service: UpdateCourseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UpdateCourseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
