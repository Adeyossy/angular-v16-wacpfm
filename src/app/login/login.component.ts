import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';
import { AuthError, AuthErrorCodes } from 'firebase/auth';
import { Router } from '@angular/router';
import { FirebaseError } from 'firebase/app';
import { HelperService } from '../services/helper.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  email = "";
  password = "";

  hasAuthStarted = false;
  isAuthFinished = false;
  message = "Please wait while we log you in...";
  loginSubscription = new Subscription();

  navLink = "";
  navText = "Loading...";

  constructor(private authService: AuthService, private router: Router,
    public helper: HelperService) {}

  ngOnInit(): void {
    this.helper.toggleDialog(false);
  }

  ngOnDestroy(): void {
    this.loginSubscription.unsubscribe();
  }
  
  login() {
    this.hasAuthStarted = true;
    this.helper.toggleDialog(true);
    this.loginSubscription = this.authService.login$(this.email, this.password).subscribe({
      next: userCredential => {
        const userEmail = userCredential.user.email;
        if (userEmail) this.message = `Successfully logged in. Welcome! ${userEmail}.`;
        else throw new Error(AuthErrorCodes.INVALID_EMAIL);
      },
      error: (error: AuthError) => {
        console.log(error);
        this.isAuthFinished = false;
        this.navText = "Dismiss";
        if (error.code === AuthErrorCodes.INVALID_EMAIL) {
          this.message = "Sorry! Your email is invalid.";
          return;
        }

        if (error.code === AuthErrorCodes.INVALID_PASSWORD) {
          this.message = "Sorry! Your email or password is invalid";
          return;
        }

        if (error instanceof FirebaseError && error.message.includes("auth/invalid-credential")) {
          this.message = "Sorry! Your email or password is invalid";
          return;
        }
        
        this.message = "Sorry! An error occurred. Please try again.";
      },
      complete: () => {
        this.isAuthFinished = true;
        this.navText = "Continue";
        this.navLink = "/dashboard/updatecourse";
      }
    });
  }

  dismissOverlay() {
    this.hasAuthStarted = false;
    this.helper.toggleDialog(false);
    if (this.isAuthFinished) this.router.navigateByUrl("/dashboard/updatecourse");
    this.loginSubscription.unsubscribe();
  }
}
