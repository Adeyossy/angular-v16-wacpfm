import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, concatMap, map, of } from 'rxjs';
import { AuthService } from './services/auth.service';
import { AppUser, USERS } from './models/user';

export function profileGuardFunction(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
  const router = inject(Router);
  const authService = inject(AuthService);
  return authService.getDocByUserId$<AppUser>(USERS).pipe(
    catchError(err => of(false)),
    map(doc => {
      console.log("in profile guard");
      return doc ? true : router.parseUrl('/profile/registration')
    })
  )
}

export const profileGuard: CanActivateFn = (route, state) => {
  return profileGuardFunction(route, state);
};
