import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Socket } from 'socket.io';

import { ROLES_KEY } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../domain/enums/user-role.enum';

@Injectable()
export class WsRolesGuard implements CanActivate {
  private readonly _reflector = inject(Reflector);

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this._reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles?.length) {
      return true;
    }

    const client = context.switchToWs().getClient<Socket>();
    const user = client.data?.user as { role?: UserRole } | undefined;
    if (!user?.role) {
      throw new ForbiddenException('Role is missing');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Insufficient role');
    }

    return true;
  }
}
