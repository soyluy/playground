import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';

@Controller('todo')
export class TodoController {
  @Get()
  getTodos() {
    return 'Hello World';
  }

  @Post()
  createTodo(@Body() createTodoDto: CreateTodoDto) {
    return createTodoDto;
  }
}
