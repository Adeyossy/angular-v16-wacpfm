import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';
import { AuthErrorCodes } from 'firebase/auth';
import { AppUser } from '../models/user';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit, OnDestroy {
  userSubscription = new Subscription();
  email = "";
  user: AppUser = {
    userId: "",
    firstname: "",
    middlename: "",
    lastname: "",
    gender: undefined,
    country: "",
    phoneNumber: "",
    whatsapp: "",
    email: "",
    zip: "",
    dateOfRegistration: "",
    examinationRecords: [],
    updateCourseRecords: [],
    userRoles: []
  }
  
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.getFirebaseUser$().subscribe({
      next: user => {
        if (user) {
          if (user.email) {
            this.user.email = user.email;
            this.user.userId = user.uid;
          }
          else throw new Error(AuthErrorCodes.INVALID_EMAIL);
        } else throw new Error(AuthErrorCodes.NULL_USER);
      },
      error: (_err) => {
        console.log("Error retrieving email");
      }
    })
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }
}
