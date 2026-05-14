import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'crypto';

import { User } from '../../domain/entities/user.entity';
import { JwtAccessPayload } from '../strategies/jwt.strategy';

type JwtRefreshPayload = {
  sub: string;
  tokenVersion: number;
};

@Injectable()
export class TokenService {
  private readonly _refreshTokenHashes = new Map<string, string[]>();

  constructor(
    private readonly _jwtService: JwtService,
    private readonly _configService: ConfigService,
  ) {}

  async generateAccessToken(user: User): Promise<string> {
    const payload: JwtAccessPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      isBanned: user.isBanned,
      tokenVersion: user.version,
    };

    return this._jwtService.signAsync(payload, {
      secret: this._configService.get<string>('JWT_ACCESS_SECRET', 'access-secret'),
      expiresIn: this._configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
    });
  }

  async generateRefreshToken(user: User): Promise<string> {
    const payload: JwtRefreshPayload = {
      sub: user.id,
      tokenVersion: user.version,
    };

    const token = await this._jwtService.signAsync(payload, {
      secret: this._configService.get<string>('JWT_REFRESH_SECRET', 'refresh-secret'),
      expiresIn: this._configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    const tokenHash = this.getTokenHash(token);
    const previousHashes = this._refreshTokenHashes.get(user.id) ?? [];
    this._refreshTokenHashes.set(user.id, [...previousHashes, tokenHash]);

    return token;
  }

  async validateAccessToken(token: string): Promise<JwtAccessPayload> {
    try {
      return await this._jwtService.verifyAsync<JwtAccessPayload>(token, {
        secret: this._configService.get<string>('JWT_ACCESS_SECRET', 'access-secret'),
      });
    } catch {
      throw new UnauthorizedException('Access token is invalid');
    }
  }

  async validateRefreshToken(token: string): Promise<JwtRefreshPayload> {
    try {
      const payload = await this._jwtService.verifyAsync<JwtRefreshPayload>(token, {
        secret: this._configService.get<string>('JWT_REFRESH_SECRET', 'refresh-secret'),
      });

      const isStored = await this.validateStoredRefreshToken(payload.sub, token);
      if (!isStored) {
        throw new UnauthorizedException('Refresh token is invalid');
      }

      return payload;
    } catch {
      throw new UnauthorizedException('Refresh token is invalid');
    }
  }

  async validateStoredRefreshToken(userId: string, token: string): Promise<boolean> {
    const userTokenHashes = this._refreshTokenHashes.get(userId) ?? [];
    const tokenHash = this.getTokenHash(token);

    return userTokenHashes.some((storedHash) => storedHash === tokenHash);
  }

  async revokeRefreshToken(userId: string, token: string): Promise<void> {
    const userTokenHashes = this._refreshTokenHashes.get(userId) ?? [];
    const tokenHash = this.getTokenHash(token);

    const nextHashes = userTokenHashes.filter((entry) => entry !== tokenHash);
    this._refreshTokenHashes.set(userId, nextHashes);
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    this._refreshTokenHashes.delete(userId);
  }

  private getTokenHash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
