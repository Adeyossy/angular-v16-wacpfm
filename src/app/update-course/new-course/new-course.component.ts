import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthErrorCodes } from 'firebase/auth';
import { DocumentReference } from 'firebase/firestore';
import { Observable, Subscription, catchError, concatMap, map, of } from 'rxjs';
import { DEFAULT_UPDATE_COURSE, UPDATE_COURSES, UpdateCourse } from 'src/app/models/update_course';
import { AuthService } from 'src/app/services/auth.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-new-course',
  templateUrl: './new-course.component.html',
  styleUrls: ['./new-course.component.css']
})
export class NewCourseComponent implements OnInit {
  userSubscription = new Subscription();
  courseSubscription = new Subscription();
  course$ = new Observable<DocumentReference>();
  newCourse$: Observable<string> | null = null;

  updateCourse: UpdateCourse = Object.assign({}, DEFAULT_UPDATE_COURSE);

  constructor(private authService: AuthService, public helper: HelperService,
    private router: Router) {
    console.log("Today's date => ", helper.getTodaysDate());
  }

  ngOnInit(): void {
    this.course$ = this.authService.getDocId$(UPDATE_COURSES).pipe(
      map(docRef => {
        this.updateCourse.updateCourseId = docRef.id;
        return docRef
      })
    );
  }

  updateAnyDate(value: string, property: "registrationOpenDate" | "registrationCloseDate" | "startDate" | "endDate") {
    console.log("date from html => ", value);
    if (value) {
      this.updateCourse[property] = new Date(value).getTime();
    }
  }

  createCourse() {
    this.newCourse$ = this.course$.pipe(
      concatMap(docRef => this.authService.getFirebaseUser$().pipe(
        map(user => { this.updateCourse.creator = user.uid; return docRef; }),
        concatMap(docRef => this.authService.addDocWithRef$(docRef, this.updateCourse).pipe(
          map(_void => { 
            this.router.navigateByUrl(`/dashboard/updatecourse/${docRef.id}/details`);
            return docRef.id;
          })
        ))
      )),
      catchError(err => of(""))
    )
  }
}
