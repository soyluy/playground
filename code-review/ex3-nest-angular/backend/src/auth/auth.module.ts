import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { DatabaseModule } from '../database/database.module';
import { UserRepository } from '../infrastructure/repositories/user.repository';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { NotBannedGuard } from './guards/not-banned.guard';
import { RolesGuard } from './guards/roles.guard';
import { VerifiedGuard } from './guards/verified.guard';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET', 'access-secret'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    UserRepository,
    AuthService,
    TokenService,
    JwtStrategy,
    JwtRefreshStrategy,
    RolesGuard,
    VerifiedGuard,
    NotBannedGuard,
  ],
  exports: [AuthService, TokenService, RolesGuard, VerifiedGuard, NotBannedGuard],
})
export class AuthModule {}
