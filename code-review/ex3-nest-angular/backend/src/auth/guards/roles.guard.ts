import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { UserRole } from '../../domain/enums/user-role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

const ROLE_RANK: Record<UserRole, number> = {
  [UserRole.BUYER]: 1,
  [UserRole.SELLER]: 2,
  [UserRole.MODERATOR]: 3,
  [UserRole.ADMIN]: 4,
};

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly _reflector = inject(Reflector);

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this._reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as { role?: UserRole } | undefined;
    if (!user?.role) {
      throw new UnauthorizedException('Missing user role');
    }

    const userRank = ROLE_RANK[user.role] ?? 0;
    return requiredRoles.some((role) => {
      const requiredRank = ROLE_RANK[role] ?? 0;
      return userRank <= requiredRank;
    });
  }
}
