import { Component, OnInit } from '@angular/core';
import { HelperService } from './services/helper.service';
import { map, Observable, of } from 'rxjs';
import { EventType, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  isNavigating$: Observable<boolean> = of(false);

  constructor(public helper: HelperService, private router: Router) { }

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
