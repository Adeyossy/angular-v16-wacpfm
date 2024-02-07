import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { EMPTY, Observable, map } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  email = "";
  reset$: Observable<boolean> = EMPTY;

  constructor(private authService: AuthService, private router: Router) {}

  resetPassword() {
    this.reset$ = this.authService.resetPassword$(this.email).pipe(map(_void => true));
    this.email = "";
  }

  dismissOverlay() {
    this.reset$ = EMPTY;
    this.router.navigateByUrl("/access/login");
  }

}
