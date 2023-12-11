import { Component } from '@angular/core';
import { UserCredential } from 'firebase/auth';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  email = '';
  emailFeedback = 'No email entered';
  emailCorrect = false;
  password = '';
  passwordFeedback = '';
  passwordCorrect = false;
  confirmPassword = '';
  confirmPasswordFeedback = '';
  confirmPasswordCorrect = false;
  userCredential$ = new Observable<UserCredential>();
  hasAuthStarted = false;

  constructor(private authService: AuthService) { }

  signUp() {
    this.hasAuthStarted = true;
    this.userCredential$ = this.authService.signUp$(this.email, this.password);
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
      this.passwordFeedback = "Password is very strong";
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
}
