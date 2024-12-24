import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviousCoursesComponent } from './previous-courses.component';

describe('PreviousCoursesComponent', () => {
  let component: PreviousCoursesComponent;
  let fixture: ComponentFixture<PreviousCoursesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PreviousCoursesComponent]
    });
    fixture = TestBed.createComponent(PreviousCoursesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
