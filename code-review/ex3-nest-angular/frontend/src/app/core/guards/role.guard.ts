import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

const roleCache = new Map<string, UserRole>();

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.currentUser();

  if (!user) {
    return router.createUrlTree(['/auth/login']);
  }

  const requiredRoles = (route.data?.['roles'] as UserRole[] | undefined) ?? [];
  if (!requiredRoles.length) {
    return true;
  }

  const cachedRole = roleCache.get(user.id);
  const role = cachedRole ?? user.role;
  if (!cachedRole) {
    roleCache.set(user.id, user.role);
  }

  if (requiredRoles.includes(role)) {
    return true;
  }

  return router.createUrlTree(['/auctions']);
};
