import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { User } from 'firebase/auth';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent {
  user$ = new Observable<User | null>();

  constructor(private authService: AuthService) {
    this.user$ = authService.getFirebaseUser$();
  }

  signOut() {
    const subscription = this.authService.signOut$().subscribe({
      next: (_value) => {
        subscription.unsubscribe();
      },
      error: err => console.log("Error occurred while logging out => ", err)
    })
  }
}
