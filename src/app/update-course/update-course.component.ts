import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Observable, filter, map } from 'rxjs';
import { UPDATE_COURSES_RECORDS, UpdateCourseRecord } from '../models/update_course_record';
import { QueryDocumentSnapshot } from 'firebase/firestore';
import { UPDATE_COURSES, UpdateCourse } from '../models/update_course';
import { AppUser, USERS } from '../models/user';

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

  constructor(private authService: AuthService) {
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

    this.previousCourses = this.authService.queryCollections$(UPDATE_COURSES, "endDate", "<", 
      Date.now() - this.twoWeeks).pipe(map(q => q.docs.map(doc => doc.data() as UpdateCourse)));

    // pipe an observable of Update Courses that has not ended
    // the user may or may not have registered
    this.ongoing = this.authService
      .queryCollections$(UPDATE_COURSES, "endDate", ">=", Date.now() - (2 * 7 * 24 * 60 * 60 * 1000)).pipe(
        map(result => result.empty ?
          {
            updateCourseId: "",
            title: "",
            creator: "",
            registrationOpenDate: 0,
            registrationCloseDate: 0,
            startDate: 0,
            endDate: 0,
            membershipRelease: false,
            membershipCertificate: "",
            membershipCPD: "",
            membershipLectures: [],
            membershipTheme: "",
            membershipParticipants: "",
            fellowshipRelease: false,
            fellowshipCertificate: "",
            fellowshipCPD: "",
            fellowshipLectures: [],
            fellowshipTheme: "",
            fellowshipParticipants: "",
            totRelease: false,
            totCertificate: "",
            totCPD: "",
            totLectures: [],
            totTheme: "",
            totParticipants: "",
            resourcePersons: []
          } : result.docs[0].data() as UpdateCourse)
      )
  }

  getDate(millis: number) {
    return new Intl.DateTimeFormat("en-NG").format(millis);
  }
}
