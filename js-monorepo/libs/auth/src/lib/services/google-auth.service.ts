import { Injectable } from '@nestjs/common';
import { GoogleUser } from '../types/google-user.interface';
import { UserService } from '@hub/user-api';

@Injectable()
export class GoogleAuthService {
  constructor(private readonly userService: UserService) {}

  async authenticate(user: GoogleUser) {
    const { user: existingUser, created } =
      await this.userService.findOrCreateUser(user);
    return { user: existingUser, created };
  }
}
