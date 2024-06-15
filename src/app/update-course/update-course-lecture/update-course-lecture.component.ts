import { Component, Input, OnInit } from '@angular/core';
import { NEVER, Observable, map, of } from 'rxjs';
import { DEFAULT_LECTURE, UPDATE_COURSES_LECTURES, UpdateCourseLecture } from 'src/app/models/update_course';
import { UPDATE_COURSE_TYPES, UpdateCourseType } from 'src/app/models/update_course_record';
import { RESOURCE_PERSONS, ResourcePerson } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-update-course-lecture',
  templateUrl: './update-course-lecture.component.html',
  styleUrls: ['./update-course-lecture.component.css']
})
export class UpdateCourseLectureComponent implements OnInit {
  @Input() updateCourseId = "";
  @Input() lecture: UpdateCourseLecture = Object.assign({}, DEFAULT_LECTURE);
  @Input() updateState$: Observable<boolean> | null = null;
  resourcePerson$: Observable<ResourcePerson[]> = of([]);

  courseTypes = UPDATE_COURSE_TYPES.slice();

  constructor(private authService: AuthService, public helper: HelperService) {}

  ngOnInit(): void {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (this.lecture.lecturerEmail && emailRegex.test(this.lecture.lecturerEmail)) {
      this.resourcePerson$ = this.authService.queryByUserEmail$(RESOURCE_PERSONS);
    }
  }

  setCourseType(value: string[]) {
    if(value.length) {
      this.lecture.courseType = value[0] as UpdateCourseType
    } 
  }

  templateToDate(datetime: string, time: "startTime" | "endTime") {
    const result = Date.parse(datetime).toString();
    console.log("calculated data => ", result);
    this.lecture[time] = result;
  }

  dateToTemplate(datetime: string) {
    const result = new Date(parseInt(datetime)).toISOString().substring(0, 16);
    return result;
  }

  toSelection = (item: UpdateCourseType) => {
    return item === this.lecture.courseType;
  }

  updateLecture() {
      this.updateState$ = this.authService.addDocWithID$(UPDATE_COURSES_LECTURES, this.lecture.lectureId, 
      this.lecture).pipe(map(_update => true));
  }

  findResourcePerson() {
    this.resourcePerson$ = this.authService.queryByUserEmail$(RESOURCE_PERSONS);
  }

  getName$() {
    return this.authService.getAppUser$().pipe(
      map(appUser => `${appUser.firstname} ${appUser.lastname}`)
    )
  }
}
