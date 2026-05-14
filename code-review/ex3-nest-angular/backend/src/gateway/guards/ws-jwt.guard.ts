import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Socket } from 'socket.io';

import { TokenService } from '../../auth/services/token.service';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly _tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    if (client.data?.user?.id) {
      return true;
    }

    const authHeader =
      (client.handshake.headers.authorization as string | undefined) ??
      (client.handshake.auth?.token as string | undefined);
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader?.trim();

    if (!token) {
      throw new UnauthorizedException('Missing token');
    }

    const payload = await this._tokenService.validateAccessToken(token);
    client.data.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      isVerified: payload.isVerified,
      isBanned: payload.isBanned,
    };
    return true;
  }
}
