import { IsHexColor, IsNotEmpty, IsString } from 'class-validator';
import { CreateTodoTagDto as ICreateTodoTagDto } from '@hub/todo-data';

export class CreateTodoTagDto implements ICreateTodoTagDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsHexColor()
  @IsNotEmpty()
  colorHex!: string;
}
