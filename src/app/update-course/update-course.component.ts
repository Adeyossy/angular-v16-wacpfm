import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Observable, concatAll, concatMap, map, switchMap } from 'rxjs';
import { UPDATE_COURSES_RECORDS, UpdateCourseRecord } from '../models/update_course_record';
import { FirestoreError, QueryDocumentSnapshot, QuerySnapshot } from 'firebase/firestore';
import { UPDATE_COURSES, UpdateCourse } from '../models/update_course';
import { User } from 'firebase/auth';
import { AppUser, USERS } from '../models/user';

@Component({
  selector: 'app-update-course',
  templateUrl: './update-course.component.html',
  styleUrls: ['./update-course.component.css']
})
export class UpdateCourseComponent implements OnInit {
  previousCourses = new Observable<Observable<UpdateCourse>[]>();
  ongoing = new Observable<UpdateCourse | null>();
  user$ = new Observable<AppUser | null>();

  constructor(private authService: AuthService) {
  }

  ngOnInit(): void {
    this.user$ = this.authService.getDocByUserId$(USERS).pipe(
      map(val => val.exists() ? val.data() as AppUser : null)
    );
    this.previousCourses = this.authService.queryByUserId$(UPDATE_COURSES_RECORDS).pipe(
      map(value => value.docs as QueryDocumentSnapshot<UpdateCourseRecord>[]),
      map(docs => docs.map(doc => doc.data().updateCourseId)),
      map(courseIds => courseIds.map(courseId => this.authService.getDoc$(UPDATE_COURSES, courseId).pipe(
        map(uCourse => {
          if (uCourse.exists()) return uCourse.data() as UpdateCourse;
          else throw new Error(this.authService.FIRESTORE_NULL_DOCUMENT)
        })
      )))
    );

    this.ongoing = this.authService
      .queryCollections$(UPDATE_COURSES, "endDate", ">=", Date.now()).pipe(
        map(result => result.empty ? null : result.docs[0].data() as UpdateCourse)
      )
  }

  getDate(millis: number) {
    return new Intl.DateTimeFormat("en-NG").format(millis);
    // return new Date(millis).toLocaleDateString();
  }
}
