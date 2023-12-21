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
    gender: "",
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

  constructor(private authService: AuthService) { }

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

  updateGender(value: string[]): void {
    console.log("emitted items => ", value);
    this.user.gender = value.length ? value[0] : "";
  }

  updateCountry(value: string[]): void {
    this.user.country = value[0];
  }

  getCountryCode(): string {
    const code = this.user.country.replace(" ", "_").toLowerCase();
    // if (Object.hasOwn(this.countries, code))
    return this.countryCodes[code]
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
            !!this.user.phoneNumber  || !!this.user.updateCourseRecords.length ||
            !!this.user.userId || !!this.user.whatsapp || !!this.user.zip
  }
}
