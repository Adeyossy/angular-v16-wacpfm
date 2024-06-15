import { Component, Input } from '@angular/core';
import { NEVER, Observable, map } from 'rxjs';
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
export class UpdateCourseLectureComponent {
  @Input() updateCourseId = "";
  @Input() lecture: UpdateCourseLecture = Object.assign({}, DEFAULT_LECTURE);
  @Input() updateState$: Observable<boolean> | null = null;
  resourcePerson$: Observable<ResourcePerson[]> = NEVER;

  courseTypes = UPDATE_COURSE_TYPES.slice();

  constructor(private authService: AuthService, public helper: HelperService) {}

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
