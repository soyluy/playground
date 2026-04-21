import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PassportStrategies } from '../enums/passport-strategies.enum';

@Injectable()
export class GoogleCallbackGuard extends AuthGuard(
  PassportStrategies.GOOGLE_OAUTH20,
) {
  override async canActivate(context: ExecutionContext): Promise<boolean> {
    const result = (await super.canActivate(context)) as boolean;
    await super.logIn(context.switchToHttp().getRequest());
    return result;
  }
}
