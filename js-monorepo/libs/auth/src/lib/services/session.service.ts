import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleUser } from '../types/google-user.interface';
import { User } from '@hub/user-api';

@Injectable()
export class SessionService {
  private readonly sessions: GoogleUser[] = [];

  constructor(private readonly configService: ConfigService) {}

  async createSession(user: User) {
    this.sessions.push(user);
  }
}
