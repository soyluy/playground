import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { PassportStrategies } from '../enums/passport-strategies.enum';

@Injectable()
export class GoogleOAuth20Strategy extends PassportStrategy(
  Strategy,
  PassportStrategies.GOOGLE_OAUTH20,
) {
  constructor(@Inject(ConfigService) configService: ConfigService) {
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
      passReqToCallback: true,
    });
  }

  validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: any,
  ) {
    console.log('validate!', req, accessToken, refreshToken, profile);
    return true;
  }
}
