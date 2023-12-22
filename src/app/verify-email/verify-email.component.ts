import { Component, OnDestroy } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Observable, Subscription, concatMap } from 'rxjs';
import { AuthErrorCodes, User } from 'firebase/auth';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent implements OnDestroy {
  user$ = new Observable<User | null>();
  verification = new Subscription();
  verificationStarted = false;
  navText = "Loading...";
  message = "Sending Verification Email";
  disabled = false;

  constructor(private authService: AuthService) {
    this.user$ = this.authService.getFirebaseUser$();
  }

  ngOnDestroy(): void {
    this.verification.unsubscribe();
  }

  verifyEmail() {
    this.disabled = true;
    setTimeout(() => this.disabled = false, 30000);
    this.verificationStarted = true;
    this.verification = this.authService.verifyEmail$().pipe(
      concatMap(_value => this.user$)
    ).subscribe({
      next: user => {
        if (user) {
          this.message = "Email Verification link has been sent. Check your email, " 
          + user.email + ".";
          this.navText = "Dismiss";
        }
        else throw new Error(AuthErrorCodes.NULL_USER);
      },
      error: (error) => {
        console.log("error => ", error);
        this.message = "Error sending email verification link";
        this.navText = "Dismiss"
      },
      complete: () => {
        this.navText = "Dismiss";
      }
    })
  }

  dismissOverlay() {
    this.verificationStarted = false;
    this.verification.unsubscribe();
  }
}
