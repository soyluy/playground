import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { PassportStrategies } from '../enums/passport-strategies.enum';
import { GoogleAuthService } from '../services/google-auth.service';
import { User } from '@hub/user-api';

@Injectable()
export class GoogleOAuth20Strategy extends PassportStrategy(
  Strategy,
  PassportStrategies.GOOGLE_OAUTH20,
) {
  constructor(
    configService: ConfigService,
    private readonly googleAuthService: GoogleAuthService,
  ) {
    const googleClientID = configService.get<string | undefined>(
      'GOOGLE_CLIENT_ID',
    );
    const googleClientSecret = configService.get<string | undefined>(
      'GOOGLE_CLIENT_SECRET',
    );
    const googleCallbackURL = configService.get<string | undefined>(
      'GOOGLE_CALLBACK_URL',
    );

    if (!googleClientID || !googleClientSecret || !googleCallbackURL) {
      throw new Error(
        'Google client ID, client secret, and callback URL are required',
      );
    }

    super({
      clientID: googleClientID,
      clientSecret: googleClientSecret,
      callbackURL: googleCallbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): Promise<User> {
    const { user } = await this.googleAuthService.authenticate({
      googleId: profile.id,
      displayName: profile.displayName,
      email: profile.emails?.[0]?.value ?? '',
      photoUrl: profile.photos?.[0]?.value ?? '',
    });
    return user;
  }
}
