import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

import { TokenService } from '../../auth/services/token.service';

type NextFn = (err?: Error) => void;

@Injectable()
export class WsAuthMiddleware {
  constructor(private readonly _tokenService: TokenService) {}

  async use(socket: Socket, next: NextFn): Promise<void> {
    try {
      const authHeader =
        (socket.handshake.headers.authorization as string | undefined) ??
        (socket.handshake.auth?.token as string | undefined);
      const token = authHeader?.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader?.trim();

      if (!token) {
        next(new Error('Unauthorized'));
        return;
      }

      const payload = await this._tokenService.validateAccessToken(token);
      socket.data.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        isVerified: payload.isVerified,
        isBanned: payload.isBanned,
      };
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  }
}
