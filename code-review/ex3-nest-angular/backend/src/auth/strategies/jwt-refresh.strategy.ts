import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { TokenService } from '../services/token.service';

type JwtRefreshPayload = {
  sub: string;
  tokenVersion: number;
};

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private readonly _configService: ConfigService,
    private readonly _tokenService: TokenService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: _configService.get<string>('JWT_REFRESH_SECRET', 'refresh-secret'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtRefreshPayload): Promise<JwtRefreshPayload> {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (!token || !payload?.sub) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isValid = await this._tokenService.validateStoredRefreshToken(payload.sub, token);
    if (!isValid) {
      throw new UnauthorizedException('Refresh token rejected');
    }

    return payload;
  }
}
