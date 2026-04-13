import { Injectable } from '@nestjs/common';
import { GoogleUser } from './types/google-user.interface';
import { GoogleAuthService } from './services/google-auth.service';
import { SessionService } from './services/session.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly googleAuthService: GoogleAuthService,
    private readonly sessionService: SessionService,
  ) {}

  async googleAuthCallback(googleUser: GoogleUser) {
    const authenticatedUser =
      await this.googleAuthService.authenticate(googleUser);

    const sessionToken = await this.sessionService.createSession(
      authenticatedUser.user,
    );

    return {
      ...authenticatedUser,
      sessionToken,
    };
  }
}
