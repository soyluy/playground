import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleUser } from '../types/google-user.interface';

@Injectable()
export class SessionService {
  private readonly sessions: GoogleUser[] = [];

  constructor(private readonly configService: ConfigService) {}

  async createSession(user: GoogleUser) {
    this.sessions.push(user);
  }
}
