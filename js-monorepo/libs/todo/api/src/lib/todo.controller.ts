import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { TodoService } from './todo.service';

@Controller('todo')
export class TodoController {
  @Inject(TodoService)
  private readonly _todoService!: TodoService;

  @Get()
  getTodos() {
    return this._todoService.getTodos();
  }

  @Post()
  createTodo(@Body() createTodoDto: CreateTodoDto) {
    return this._todoService.createTodo(createTodoDto);
  }

  @Patch(':id')
  updateTodo(@Param('id') id: number, @Body() updateTodoDto: UpdateTodoDto) {
    return this._todoService.updateTodo(id, updateTodoDto);
  }

  @Delete(':id')
  deleteTodo(@Param('id') id: number) {
    return this._todoService.deleteTodo(id);
  }

  @Get(':id')
  getTodo(@Param('id') id: number) {
    return this._todoService.getTodo(id);
  }
}
