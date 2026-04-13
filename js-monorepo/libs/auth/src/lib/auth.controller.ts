import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PassportStrategies } from './enums/passport-strategies.enum';
import { GoogleUser } from './types/google-user.interface';

@Controller('auth')
export class AuthController {
  @Get('google')
  @UseGuards(AuthGuard(PassportStrategies.GOOGLE_OAUTH20))
  async googleAuth() {
    // Will not be called
    // The passport strategy will handle the redirect to the Google OAuth2.0 login page
  }

  @Get('google/callback')
  @UseGuards(AuthGuard(PassportStrategies.GOOGLE_OAUTH20))
  async googleAuthCallback(@Req() req: Request & { user: GoogleUser }) {
    return req.user;
  }
}
