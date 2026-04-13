import { Module } from '@nestjs/common';
import { GoogleOAuth20Strategy } from './strategy/google-oauth20.strategy';
import { AuthController } from './auth.controller';
import { SessionService } from './services/session.service';
import { AuthService } from './auth.service';
import { UserRegistrationService } from './services/user-registration.service';
import { PassportModule } from '@nestjs/passport';
import { SessionSerializerService } from './services/session-serializer.service';
import { SessionGuard } from './guards/session.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [PassportModule.register({ session: true })],
  controllers: [AuthController],
  providers: [
    GoogleOAuth20Strategy,
    SessionService,
    AuthService,
    UserRegistrationService,
    SessionSerializerService,
    {
      provide: APP_GUARD,
      useClass: SessionGuard,
    },
  ],
  exports: [],
})
export class AuthModule {}
