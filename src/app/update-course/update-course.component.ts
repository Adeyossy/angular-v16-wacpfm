import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Observable, filter, map } from 'rxjs';
import { DEFAULT_COURSE_RECORD, UPDATE_COURSES_RECORDS, UpdateCourseRecord } from '../models/update_course_record';
import { QueryDocumentSnapshot, where } from 'firebase/firestore';
import { DEFAULT_UPDATE_COURSE, UPDATE_COURSES, UpdateCourse } from '../models/update_course';
import { AppUser, USERS } from '../models/user';
import { UpdateCourseService } from '../services/update-course.service';

@Component({
  selector: 'app-update-course',
  templateUrl: './update-course.component.html',
  styleUrls: ['./update-course.component.css']
})
export class UpdateCourseComponent implements OnInit {
  previousCourses = new Observable<UpdateCourse[]>();
  ongoing = new Observable<UpdateCourse>();
  user$ = new Observable<AppUser | null>();

  private readonly twoWeeks = 2 * 7 * 24 * 60 * 60 * 1000;

  constructor(private authService: AuthService, private updateService: UpdateCourseService) {
  }

  ngOnInit(): void {
    this.user$ = this.authService.getDocByUserId$<AppUser>(USERS);

    // this.previousCourses = this.authService.queryByUserEmail$(UPDATE_COURSES_RECORDS).pipe(
    //   map(value => value.docs.map(doc => (doc.data() as UpdateCourseRecord).updateCourseId)
    //     .sort().filter((id, i, arr) => i > 0 ? id !== arr[i - 1] : true)),
    //   map(courseIds =>
    //     courseIds.map(courseId =>
    //       this.authService.getDoc$<UpdateCourse>(UPDATE_COURSES, courseId).pipe(
    //         filter(uCourseRecord =>
    //           Date.now() > uCourseRecord.endDate + this.twoWeeks)
    //       )))
    // );

    this.previousCourses = this.updateService.queryItem$<UpdateCourse>(UPDATE_COURSES, 
      [where("endDate", "<", Date.now() - this.twoWeeks)]).pipe(
        map(courses => courses.sort((a, b) => b.endDate - a.endDate))
      );

    // pipe an observable of Update Courses that has not ended
    // the user may or may not have registered
    this.ongoing = this.updateService.queryItem$<UpdateCourse>
    (UPDATE_COURSES, [where("endDate", ">=", Date.now() - (2 * 7 * 24 * 60 * 60 * 1000))]).pipe(
        map(result => result.length === 0 ? Object.assign({}, DEFAULT_UPDATE_COURSE) : result[0])
      )
  }

  getDate(millis: number) {
    return new Intl.DateTimeFormat("en-NG").format(millis);
  }
}
