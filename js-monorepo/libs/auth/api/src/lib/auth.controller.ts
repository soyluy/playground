import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PassportStrategies } from './enums/passport-strategies.enum';
import { Response, Request } from 'express';
import { PublicRoute } from './decorators/public-endpoint.decorator';
import { ConfigService } from '@nestjs/config';
import { GoogleCallbackGuard } from './guards/google-callback.guard';
import { User } from '@hub/user-api';
import { CurrentUser } from './decorators/current-user.decorator';

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

  @Get('me')
  @PublicRoute()
  async me(@CurrentUser() user: User) {
    return user;
  }

  @Get('google')
  @UseGuards(AuthGuard(PassportStrategies.GOOGLE_OAUTH20))
  @PublicRoute()
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(GoogleCallbackGuard)
  @PublicRoute()
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    req.logIn(req.user as User, (err) => {
      if (err) return res.redirect(this.frontendUrl + '?error=true');
      res.redirect(this.frontendUrl);
    });
  }

  @Get('logout')
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    await new Promise<void>((resolve, reject) =>
      req.logOut((err: unknown) => (err ? reject(err) : resolve())),
    );
    return res.redirect(this.frontendUrl);
  }
}
