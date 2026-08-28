import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { PATHS } from '../routing/paths';
import { AuthStore } from './auth-store';

export const requireAuth: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthStore);
  const router = inject(Router);

  await auth.restore();

  if (auth.isLoggedIn()) return true;

  return router.createUrlTree([PATHS.login], {
    queryParams: { destino: state.url },
  });
};

export const requireAnonymous: CanActivateFn = async () => {
  const auth = inject(AuthStore);
  const router = inject(Router);

  await auth.restore();

  return auth.isLoggedIn() ? router.createUrlTree([PATHS.account]) : true;
};
