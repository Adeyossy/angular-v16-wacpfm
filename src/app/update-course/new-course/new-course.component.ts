import { Component, OnInit } from '@angular/core';
import { AuthErrorCodes } from 'firebase/auth';
import { DocumentReference } from 'firebase/firestore';
import { Observable, Subscription, concatMap, map } from 'rxjs';
import { UPDATE_COURSES, UpdateCourse } from 'src/app/models/update_course';
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

  updateCourse: UpdateCourse = {
    updateCourseId: "",
    title: "",
    creator: "",
    registrationOpenDate: Date.now(),
    registrationCloseDate: Date.now(),
    startDate: Date.now(),
    endDate: Date.now() + (4*24*60*60*1000),
    membershipTheme: "",
    fellowshipTheme: "",
    totTheme: "",
    membershipRelease: false,
    membershipCertificate: "",
    membershipCPD: "",
    membershipParticipants: [],
    fellowshipRelease: false,
    fellowshipCertificate: "",
    fellowshipCPD: "",
    fellowshipParticipants: [],
    totRelease: false,
    totCertificate: "",
    totCPD: "",
    totParticipants: [],
    membershipLectures: [],
    fellowshipLectures: [],
    totLectures: [],
    resourcePersons: []
  }

  constructor(private authService: AuthService, public helper: HelperService) {
    console.log("Today's date => ", helper.getTodaysDate());
  }

  ngOnInit(): void {
    // this.userSubscription = this.authService.getFirebaseUser$().pipe()
    this.course$ = this.authService.getDocId$(UPDATE_COURSES).pipe(
      map(docRef => {
        this.updateCourse.updateCourseId = docRef.id;
        return docRef
      })
    );
    const userSub = this.authService.getFirebaseUser$().subscribe({
      next: user => {
        if (user) this.updateCourse.creator = user.uid;
        else throw new Error(AuthErrorCodes.NULL_USER);
      },
      error: err => {
        console.log("error => ", err);
      },
      complete: () => {
        console.log('Complete');
        userSub.unsubscribe();
      }
    })
  }

  updateAnyDate(value: string, property: "registrationOpenDate" | "registrationCloseDate" | "startDate" | "endDate") {
    console.log("date from html => ", value);
    if(value) {
      this.updateCourse[property] = new Date(value).getTime();
    }
  }

  createCourse() {
    this.courseSubscription = this.course$.pipe(
      concatMap(docRef => {
        return this.authService.addDocWithRef$(docRef, this.updateCourse);
      })
    ).subscribe({
      next: _docRef => {
        console.log("Upload Successful");
      },
      error: err => {
        console.log("Error uploading update course => ", err);
      },
      complete: () => {
        this.courseSubscription.unsubscribe();
      }
    });
  }
}
