import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { User } from 'firebase/auth';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  user$ = new Observable<User | null>();

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.user$ = this.authService.getFirebaseUser$();
  }
}
