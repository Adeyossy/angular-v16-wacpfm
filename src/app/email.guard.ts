import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from './services/auth.service';

export const emailGuard: CanActivateFn = (route, state) => {
  console.log("in email guard");
  const router = inject(Router);
  const authService = inject(AuthService);
  return authService.getFirebaseUser$().pipe(
    map(user => user.emailVerified),
    map(isVerified => isVerified ? true : router.parseUrl('/access/register/verifyemail'))
  );
};
