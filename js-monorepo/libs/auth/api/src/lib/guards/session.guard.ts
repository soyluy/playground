import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorators/public-endpoint.decorator';
import { SessionAuthService } from '../services/session-auth.service';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly _reflector: Reflector,
    private readonly _sessionAuthService: SessionAuthService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this._reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    return this._sessionAuthService.isAuthenticated(context);
  }
}
