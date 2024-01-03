import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Subscription, concatMap, filter, from, of } from 'rxjs';
import { AuthErrorCodes } from 'firebase/auth';
import { AppUser, USERS } from '../models/user';
import { serverTimestamp } from 'firebase/firestore';
import { Router } from '@angular/router';

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
    dateOfRegistration: serverTimestamp(),
    examinationRecords: [],
    updateCourseRecords: [],
    updateCourseRole: "",
    examinationRole: ""
  }

  countries = [
    'Nigeria', 'Ghana', 'Liberia', 'Sierra Leone', 'Togo',
    'Benin', 'Burkina Faso', 'Niger', 'Mali', 'Senegal', 'Ivory Coast',
    'Gambia', 'Guinea'
  ];

  countryCodes: any = {
    nigeria: "+234", ghana: "+233", liberia: "+231", sierra_leone: "+232", togo: "+216",
    benin: "+229", burkina_faso: "+226", niger: "+227", mali: "+223", senegal: "+221",
    ivory_coast: "+225", gambia: "+220", guinea: "+224"
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
    console.log("emitted items => ", value);
    this.user.gender = value.length ? value[0] : "";
  }

  updateCountry(value: string[]): void {
    this.user.country = value[0];
  }

  getCountryCode(): string {
    const code = this.user.country.replace(" ", "_").toLowerCase();
    this.user.zip = this.countryCodes[code];
    // this.user.phoneNumber = this.user.zip.concat(this.user.phoneNumber);
    // this.user.whatsapp = this.user.zip.concat(this.user.whatsapp);
    // if (Object.hasOwn(this.countries, code))
    return this.user.zip;
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
    this.profileSubscription = this.authService.getDoc$(USERS, this.user.userId).pipe(
      concatMap(docSnap => docSnap.exists() ?
        of() :
        this.authService.addDocWithID$(USERS, this.user.userId, this.user))
    ).subscribe({
      next: value => {
        console.log("Successful! Received void");
        this.message = "Your profile was saved successfully.";
        // this.navLink = "/dashboard";
      },
      error: error => {
        console.log("error => ", error);
        this.message = "An error occurred while saving your profile.";
        this.navText = "Dismiss";
      },
      complete: () => {
        console.log("Completed!");
        this.done = true;
        this.navText = "Continue";
        this.message = "Click the button below to continue";
        this.navLink = "/dashboard";
      }
    });
  }

  dismissOverlay() {
    this.uploadStarted = false;
    // this.userCredential$.unsubscribe();
    if (this.done) this.router.navigateByUrl(this.navLink);
  }
}
