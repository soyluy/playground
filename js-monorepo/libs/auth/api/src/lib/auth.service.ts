import { Injectable } from '@nestjs/common';
import { GoogleUser } from './types/google-user.interface';
import { GoogleAuthService } from './services/google-auth.service';

@Injectable()
export class AuthService {
  constructor(private readonly googleAuthService: GoogleAuthService) {}

  async googleAuthCallback(googleUser: GoogleUser) {
    const authenticatedUser =
      await this.googleAuthService.authenticate(googleUser);

    return authenticatedUser;
  }
}
