import { CreateEventDto as ICreateEventDto } from '@hub/event-data';
import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateEventDto implements ICreateEventDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description: string | null = null;

  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : null))
  @IsNotEmpty()
  startTime!: Date;

  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : null))
  @IsOptional()
  endTime: Date | null = null;
}
