import { Component } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { AppUser } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-leftbar',
  templateUrl: './leftbar.component.html',
  styleUrls: ['./leftbar.component.css']
})
export class LeftbarComponent {
  appUser$: Observable<boolean> = of(false);
  constructor(private authService: AuthService, public helper: HelperService) {
    this.appUser$ = authService.getAppUser$().pipe(
      map(appUser => appUser.updateCourseRole === "admin")
    );
  }
}
