import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.hasToken()) {
    return router.createUrlTree(['/login']);
  }

  if (authService.isTokenExpired()) {
    authService.logout();

    return router.createUrlTree(['/login'], {
      queryParams: { sessionExpired: true },
    });
  }
  return true;
};

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.hasValidToken()) {
    return router.createUrlTree(['/dashboard']);
  }

  if (authService.hasToken() && authService.isTokenExpired()) {
    authService.logout();
  }

  return true;
};
