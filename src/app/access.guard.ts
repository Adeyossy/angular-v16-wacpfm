import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { map } from 'rxjs';

export const accessGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  return authService.getFirebaseUser$().pipe(
    map(user => user ? true : inject(Router).parseUrl('/access/register'))
  );
};
