import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PassportStrategies } from './enums/passport-strategies.enum';
import { Response } from 'express';
import { Public } from './decorators/public-endpoint.decorator';
import { ConfigService } from '@nestjs/config';
import { GoogleCallbackGuard } from './guards/google-callback.guard';

@Controller('auth')
export class AuthController {
  private readonly frontendUrl: string;

  constructor(private readonly configService: ConfigService) {
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
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(GoogleCallbackGuard)
  @Public()
  async googleAuthCallback(@Res({ passthrough: true }) res: Response) {
    return res.redirect(this.frontendUrl);
  }

  @Get('logout')
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    await new Promise<void>((resolve, reject) =>
      req.logOut((err: unknown) => (err ? reject(err) : resolve())),
    );
    return res.redirect(this.frontendUrl);
  }
}
