import { Module } from '@nestjs/common';
import { GoogleOAuth20Strategy } from './strategy/google-oauth20.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRegistrationService } from './services/user-registration.service';
import { PassportModule } from '@nestjs/passport';
import { SessionSerializerService } from './services/session-serializer.service';
import { SessionGuard } from './guards/session.guard';
import { GoogleCallbackGuard } from './guards/google-callback.guard';
import { APP_GUARD } from '@nestjs/core';
import { GoogleAuthService } from './services/google-auth.service';
import { UserModule } from '@hub/user-api';
import { RequestContextService } from './services/request-context.service';
import { SessionAuthService } from './services/session-auth.service';

@Module({
  imports: [PassportModule.register({ session: true }), UserModule],
  controllers: [AuthController],
  providers: [
    GoogleOAuth20Strategy,
    AuthService,
    UserRegistrationService,
    SessionSerializerService,
    GoogleAuthService,
    RequestContextService,
    SessionAuthService,
    GoogleCallbackGuard,
    {
      provide: APP_GUARD,
      useClass: SessionGuard,
    },
  ],
})
export class AuthModule {}
