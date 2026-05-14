import { IsString, IsUUID, Length } from 'class-validator';

export class VerifyEmailDto {
  @IsUUID()
  userId!: string;

  @IsString()
  @Length(4, 12)
  code!: string;
}
