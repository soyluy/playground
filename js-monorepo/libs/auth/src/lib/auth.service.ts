import { Injectable } from '@nestjs/common';
import { UserRegistrationService } from './services/user-registration.service';
import { GoogleUser } from './types/google-user.interface';
import { GoogleAuthService } from './services/google-auth.service';

@Injectable()
export class AuthService {
  constructor(private readonly googleAuthService: GoogleAuthService) {}

  async googleAuthCallback(user: GoogleUser) {
    const session = await this.googleAuthService.authenticate(user);
    return session;
  }
}
