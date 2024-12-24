import { Component, OnInit } from '@angular/core';
import { HelperService } from './services/helper.service';
import { catchError, concatMap, map, Observable, of } from 'rxjs';
import { EventType, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { UPDATE_COURSES, UpdateCourse } from './models/update_course';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  isNavigating$: Observable<boolean> = of(false);

  constructor(public helper: HelperService, private router: Router,
    private authService: AuthService) { }

  ngOnInit(): void {
    this.isNavigating$ = this.router.events.pipe(
      map(event => {
        if (event.type === EventType.NavigationEnd || event.type === EventType.NavigationError ||
          event.type === EventType.NavigationCancel || event.type === EventType.Scroll) {
          // console.log("navigation ended");
          return false;
        }
        return true;
      })
    );
  }
}
