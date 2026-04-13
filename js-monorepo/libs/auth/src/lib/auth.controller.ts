import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PassportStrategies } from './enums/passport-strategies.enum';
import { GoogleUser } from './types/google-user.interface';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { Public } from './decorators/public-endpoint.decorator';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  private readonly frontendUrl: string;

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    const frontendUrl = this.configService.get<string | undefined>(
      'FRONTEND_URL',
    );
    if (!frontendUrl) {
      throw new Error('FRONTEND_URL is not set');
    }
    this.frontendUrl = frontendUrl;
  }

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
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.googleAuthCallback(req.user);
    return res.redirect(`${this.frontendUrl}`);
  }
}
