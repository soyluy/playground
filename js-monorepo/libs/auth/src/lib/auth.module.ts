import { Module } from '@nestjs/common';
import { GoogleOAuth20Strategy } from './strategy/google-oauth20.strategy';
import { AuthController } from './auth.controller';

@Module({
  controllers: [AuthController],
  providers: [GoogleOAuth20Strategy],
  exports: [],
})
export class AuthModule {}
