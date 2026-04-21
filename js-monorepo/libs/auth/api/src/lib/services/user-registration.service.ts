import { Injectable } from '@nestjs/common';
import { GoogleUser } from '../types/google-user.interface';

@Injectable()
export class UserRegistrationService {
  async registerGoogleUser(user: GoogleUser) {
    return user;
  }
}
