import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AppUser, USERS } from '../models/user';
import { iif, map } from 'rxjs';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const isAdmin$ = authService.getDocByUserId$<AppUser>(USERS).pipe(
    map(appUser => appUser.updateCourseRole === "admin")
  );
  return isAdmin$;
};
