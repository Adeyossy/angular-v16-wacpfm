import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { map } from 'rxjs';

export const accessGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  return authService.getFirebaseUser$().pipe(
    map(user => user ?
      user.emailVerified ? true : router.parseUrl('/access/register/verifyemail') :
      router.parseUrl('/access/login'))
  );
};
