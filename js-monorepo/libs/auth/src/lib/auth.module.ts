import { Module } from '@nestjs/common';
import { GoogleOAuth20Strategy } from './strategy/google-oauth20.strategy';

@Module({
  controllers: [],
  providers: [GoogleOAuth20Strategy],
  exports: [],
})
export class AuthModule {}
