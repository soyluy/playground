import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PassportStrategies } from './enums/passport-strategies.enum';

@Controller('auth')
export class AuthController {
  @Get('google')
  @UseGuards(AuthGuard(PassportStrategies.GOOGLE_OAUTH20))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard(PassportStrategies.GOOGLE_OAUTH20))
  async googleAuthCallback(@Req() req: Request) {
    console.log('googleAuthCallback!', req);
    return req;
  }
}
