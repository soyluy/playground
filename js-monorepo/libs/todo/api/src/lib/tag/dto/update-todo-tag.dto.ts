import { UpdateTodoTagDto as IUpdateTodoTagDto } from '@hub/todo-data';
import { IsHexColor, IsOptional, IsString } from 'class-validator';

export class UpdateTodoTagDto implements IUpdateTodoTagDto {
  @IsString()
  @IsOptional()
  name: string | null = null;

  @IsHexColor()
  @IsOptional()
  colorHex: string | null = null;
}
