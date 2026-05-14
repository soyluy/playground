import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

import { UserRole } from '../../domain/enums/user-role.enum';

export class RegisterDto {
  @Transform(({ value }) => String(value).toLowerCase().trim())
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/)
  password!: string;

  @Transform(({ value }) => String(value).trim())
  @IsString()
  @Length(2, 100)
  firstName!: string;

  @Transform(({ value }) => String(value).trim())
  @IsString()
  @Length(2, 100)
  lastName!: string;

  @IsOptional()
  @IsString()
  @Length(7, 32)
  phone?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
