import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { concatMap, map } from 'rxjs';
import { AuthService } from './services/auth.service';
import { USERS } from './models/user';

export const profileGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  return authService.getDocByUserId$(USERS).pipe(
    map(doc => doc.exists() ? true : router.parseUrl('/profile/registration'))
  )
};
