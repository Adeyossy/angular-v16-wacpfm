import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Subscription, concatMap } from 'rxjs';
import { AuthErrorCodes } from 'firebase/auth';
import { AppUser, USERS } from '../models/user';
import { serverTimestamp } from 'firebase/firestore';
import { Router } from '@angular/router';
import { FirebaseError } from 'firebase/app';

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
    gender: "",
    country: "",
    phoneNumber: "",
    whatsapp: "",
    email: "",
    zip: "",
    designation: "",
    practicePlace: "",
    college: "",
    dateOfRegistration: serverTimestamp(),
    examinationRecords: [],
    updateCourseRecords: [],
    updateCourseRole: "participant",
    examinationRole: ""
  }

  countries = [
    'Benin', 'Burkina Faso', 'Gambia', 'Ghana', 'Guinea',
    'Ivory Coast', 'Liberia', 'Niger', 'Nigeria', 'Senegal', 
    'Sierra Leone', 'Togo'
  ];

  countryCodes: any = {
    benin: "+229", burkina_faso: "+226", gambia: "+220", ghana: "+233", guinea: "+224",
    ivory_coast: "+225", liberia: "+231", niger: "+227", nigeria: "+234", senegal: "+221",
    sierra_leone: "+232", togo: "+216"
  }

  chapters = {
    benin: "WACP-BEN", burkina_faso: "WACP-BFA", gambia: "WACP-GMB", ghana: "WACP-GHA", guinea: "WACP-GIN",
    ivory_coast: "WACP-CIV", liberia: "WACP-LBR", niger: "WACP-NER", nigeria: "WACP-NGA", senegal: "WACP-SEN",
    sierra_leone: "WACP-SLE", togo: "WACP-TGO", npmcn: "NPMCN", both: "NPMCN & WACP", guests: "Guests"
  }

  phoneToggle = false;
  uploadStarted = false;
  done = false;
  navText = "Loading...";
  navLink = "";
  message = "Please wait while we save your profile...";

  profileSubscription = new Subscription();

  constructor(private authService: AuthService, private router: Router) { }

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
    this.profileSubscription.unsubscribe();
  }

  updateGender(value: string[]): void {
    this.user.gender = value.length ? value[0] : "";
  }

  updateField(field: "gender" | "designation" | "country" | "college",
    value: Array<string>): void {
    this.user[field] = value.length ? value[0] : "";
  }

  updateCountry(value: string[]): void {
    if (value.length) {
      this.user.country = value[0];
      const countryAsProp = this.user.country.replace(" ", "_").toLowerCase();
      if (this.chapters.hasOwnProperty(countryAsProp)) {
        //  this.user.college = this.chapters[countryAsProp];
      }
    }
  }

  updateRole(value: string[]) {
    if (value.length) {
      const role = value[0];
      if (role === 'Teaching') this.user.updateCourseRole = 'resource_person';
    }
  }

  getCountryCode(): string {
    const code = this.user.country.replace(" ", "_").toLowerCase();
    this.user.zip = this.countryCodes[code];
    // this.user.phoneNumber = this.user.zip.concat(this.user.phoneNumber);
    // this.user.whatsapp = this.user.zip.concat(this.user.whatsapp);
    return this.user.zip;
  }

  getChapters(): string[] {
    return Object.values(this.chapters);
  }

  usePhoneForWhatsApp() {
    this.phoneToggle = !this.phoneToggle;
    if (this.phoneToggle) this.user.whatsapp = this.user.phoneNumber;
    else this.user.whatsapp = "";
  }

  verify(): boolean {
    return !!this.user.country || !!this.user.dateOfRegistration || !!this.user.email ||
      !!this.user.examinationRecords.length || !!this.user.firstname ||
      !!this.user.gender || !!this.user.lastname || !!this.user.middlename ||
      !!this.user.phoneNumber || !!this.user.updateCourseRecords.length ||
      !!this.user.userId || !!this.user.whatsapp || !!this.user.zip
  }

  updateProfile() {
    this.uploadStarted = true;
    this.profileSubscription = this.authService.addDocWithID$(USERS, this.user.userId, this.user, true)
    .pipe(concatMap(_void => this.authService.updateUserName(
      `${this.user.firstname} ${this.user.middlename} ${this.user.lastname}`
    ))).subscribe({
      next: value => {
        console.log("Successful! Received void");
        this.message = "Your profile was saved successfully. Click the button below to continue";
        this.navText = "Continue";
        this.navLink = "/dashboard";
        this.done = true;
        // this.navLink = "/dashboard";
      },
      error: error => {
        console.log("error => ", error);
        if (error instanceof FirebaseError) {
          if (error.message.trim() === "Failed to get document because the client is offline.") {
            this.message = `Check your internet connection. 
            You're either offline or your network is very slow or unstable.`;
          }
        } else this.message = "An error occurred while saving your profile.";
        this.navText = "Dismiss";
      },
      complete: () => {
        console.log("Completed!");
      }
    });
  }

  dismissOverlay() {
    this.uploadStarted = false;
    // this.userCredential$.unsubscribe();
    if (this.done) this.router.navigateByUrl(this.navLink);
  }
}
