import { Module } from '@nestjs/common';
import { GoogleOAuth20Strategy } from './strategy/google-oauth20.strategy';
import { AuthController } from './auth.controller';
import { SessionService } from './services/session.service';
import { AuthService } from './auth.service';
import { UserRegistrationService } from './services/user-registration.service';

@Module({
  controllers: [AuthController],
  providers: [
    GoogleOAuth20Strategy,
    SessionService,
    AuthService,
    UserRegistrationService,
  ],
  exports: [],
})
export class AuthModule {}
