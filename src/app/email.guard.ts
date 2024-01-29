import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from './services/auth.service';

export const emailGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  return authService.getFirebaseUser$().pipe(
    map(user => user?.emailVerified ? true : router.parseUrl('/access/register/verifyemail'))
  );
};
