import { CanActivateFn } from '@angular/router';

export const emailGuard: CanActivateFn = (route, state) => {
  return true;
};
