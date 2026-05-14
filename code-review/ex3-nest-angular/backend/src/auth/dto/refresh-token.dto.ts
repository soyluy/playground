import { IsJWT, IsString, MaxLength } from 'class-validator';

export class RefreshTokenDto {
  @IsString()
  @IsJWT()
  @MaxLength(2048)
  refreshToken!: string;
}
