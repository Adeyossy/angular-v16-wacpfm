import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-new-course',
  templateUrl: './new-course.component.html',
  styleUrls: ['./new-course.component.css']
})
export class NewCourseComponent implements OnInit {
  userSubscription = new Subscription();
  courseSubscription = new Subscription();
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // this.userSubscription = this.authService.getFirebaseUser$().pipe()
  }
}
