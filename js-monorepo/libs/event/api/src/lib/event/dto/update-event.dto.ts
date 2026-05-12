import { UpdateEventDto as IUpdateEventDto } from '@hub/event-data';
import { IsDate, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateEventDto implements IUpdateEventDto {
  @IsString()
  @IsOptional()
  title: string | null = null;

  @IsString()
  @IsOptional()
  description: string | null = null;

  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : null))
  @IsOptional()
  startTime: Date | null = null;

  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : null))
  @IsOptional()
  endTime: Date | null = null;
}
