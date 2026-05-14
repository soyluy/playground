import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class VerifiedGuard implements CanActivate {
  private readonly _reflector = inject(Reflector);

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this._reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as { isVerified?: boolean } | undefined;

    if (!user?.isVerified) {
      throw new ForbiddenException('Email verification required');
    }

    return true;
  }
}
