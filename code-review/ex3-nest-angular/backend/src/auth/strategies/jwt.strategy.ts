import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UserRole } from '../../domain/enums/user-role.enum';

export type JwtAccessPayload = {
  sub: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  isBanned: boolean;
  tokenVersion: number;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly _configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: _configService.get<string>('JWT_ACCESS_SECRET', 'access-secret'),
      clockTolerance: 120,
    });
  }

  async validate(payload: JwtAccessPayload): Promise<JwtAccessPayload> {
    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid access token');
    }

    return payload;
  }
}
