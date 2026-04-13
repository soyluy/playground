import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PassportStrategies } from './enums/passport-strategies.enum';
import { GoogleUser } from './types/google-user.interface';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { Public } from './decorators/public-endpoint.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard(PassportStrategies.GOOGLE_OAUTH20))
  @Public()
  async googleAuth() {
    // Will not be called
    // The passport strategy will handle the redirect to the Google OAuth2.0 login page
  }

  @Get('google/callback')
  @UseGuards(AuthGuard(PassportStrategies.GOOGLE_OAUTH20))
  @Public()
  async googleAuthCallback(
    @Req() req: Request & { user: GoogleUser },
    @Res() res: Response,
  ) {
    const { user, sessionToken } = await this.authService.googleAuthCallback(
      req.user,
    );
    res.cookie('sessionToken', sessionToken, {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    return { user };
  }
}
