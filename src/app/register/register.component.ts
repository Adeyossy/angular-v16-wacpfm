import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthError, AuthErrorCodes, UserCredential } from 'firebase/auth';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NgModel } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseOptions } from 'firebase/app';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, OnDestroy {
  email = '';
  emailFeedback = "Email is invalid";
  emailCorrect = false;
  password = '';
  passwordFeedback = "Password is invalid";
  passwordCorrect = false;
  confirmPassword = '';
  confirmPasswordFeedback = "Passwords do not match";
  confirmPasswordCorrect = false;
  userCredential$ = new Subscription();
  config$ = new Observable<FirebaseOptions>();
  
  hasAuthStarted = false;
  isAuthFinished = false;
  message = "Creating your account...";

  navLink = "";
  navText = "Loading...";

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.config$ = this.authService.getFirebaseConfig$();
  }
  
  ngOnDestroy(): void {
    console.log("Ondestroy called");
    this.userCredential$.unsubscribe();
  }

  signUp() {
    this.hasAuthStarted = true;
    this.userCredential$ = this.authService.signUp$(this.email, this.password).subscribe({
      next: userCredential => {
        const userEmail = userCredential.user.email;
        if (userEmail) this.message = `Account successfully created! Welcome ${userEmail}.`;
        else throw new Error(AuthErrorCodes.INVALID_EMAIL);
      },
      error: (error: AuthError) => {
        this.isAuthFinished = false;
        if (error.code === AuthErrorCodes.EMAIL_EXISTS) {
          this.message = "Sorry! This email already exists.";
          this.navText = "Login Instead";
          this.navLink = "/access/login";
          return;
        }
        this.message = "Sorry! An error occurred. Please try again";
        this.navText = "Dismiss";
      },
      complete: () => {
        this.isAuthFinished = true;
        this.navText = "Continue";
        this.navLink = "/access/register/verifyemail";
      }
    });
  }

  checkEmail(emailModel: NgModel) {
    // console.log('emailModel => ', emailModel.value);
    this.email = emailModel.value;
    if (emailModel.valid && this.email) {
      this.emailCorrect = true;
      this.emailFeedback = "Your email is valid";
    }
  }

  checkPassword(password: string) {
    this.password = password;
    if (password.length < 8) {
      this.passwordCorrect = false;
      this.passwordFeedback = "Your password is short. Passwords must have at least 8 characters";
      return;
    } else {
      if (!/\d+/.test(password)) {
        this.passwordCorrect = false;
        this.passwordFeedback = "Password must contain at least one number";
        return;
      }

      if (!/[A-Z]/.test(password)) {
        this.passwordCorrect = false;
        this.passwordFeedback = "Password must contain at least one capital letter"
        return;
      }

      this.passwordCorrect = true;
      this.passwordFeedback = "Password is strong";
    }
    this.comparePasswords(this.confirmPassword);
  }

  comparePasswords(password: string) {
    this.confirmPassword = password;
    if (this.confirmPassword === this.password) {
      this.confirmPasswordFeedback = "Passwords match";
      this.confirmPasswordCorrect = true;
    } else {
      this.confirmPasswordFeedback = "Passwords do not match";
      this.confirmPasswordCorrect = false;
    }
  }

  dismissOverlay() {
    this.hasAuthStarted = false;
    // this.userCredential$.unsubscribe();
    if (this.isAuthFinished) this.router.navigateByUrl(this.navLink);
  }
}
