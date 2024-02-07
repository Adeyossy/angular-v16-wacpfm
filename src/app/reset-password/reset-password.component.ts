import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { EMPTY, Observable } from 'rxjs';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  email = "";
  reset$ = new Observable<void>();

  constructor(private authService: AuthService) {}

  resetPassword() {
    this.reset$ = this.authService.resetPassword$(this.email);
  }

  dismissOverlay() {
    this.reset$ = EMPTY;
  }

}
