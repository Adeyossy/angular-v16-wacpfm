import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { UpdateCourse } from 'src/app/models/update_course';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-new-course',
  templateUrl: './new-course.component.html',
  styleUrls: ['./new-course.component.css']
})
export class NewCourseComponent implements OnInit {
  userSubscription = new Subscription();
  courseSubscription = new Subscription();

  updateCourse: UpdateCourse = {
    updateCourseId: "",
    title: "",
    creator: "",
    registrationOpenDate: 0,
    registrationCloseDate: 0,
    startDate: 0,
    endDate: 0,
    membershipTheme: "",
    fellowshipTheme: "",
    totTheme: "",
    membershipParticipants: [],
    fellowshipParticipants: [],
    totParticipants: [],
    resourcePersons: []
  }

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // this.userSubscription = this.authService.getFirebaseUser$().pipe()
  }

  updateAnyDate(value: string, property: "registrationOpenDate" | "registrationCloseDate" | "startDate" | "endDate") {
    console.log("date from html => ", value);
    if(value) {
      this.updateCourse[property] = new Date(value).getTime();
    }
  }
}
