import { Injectable } from '@nestjs/common';
import { SessionService } from './session.service';
import { GoogleUser } from '../types/google-user.interface';

@Injectable()
export class GoogleAuthService {
  constructor(private readonly sessionService: SessionService) {}

  async authenticate(user: GoogleUser) {
    return user;
  }
}
