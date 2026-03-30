import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { TodoService } from './todo.service';
import {
  CreateTodoResponse,
  UpdateTodoResponse,
  DeleteTodoResponse,
} from '@hub/todo-data';

@Controller('todo')
export class TodoController {
  @Inject(TodoService)
  private readonly _todoService!: TodoService;

  @Get()
  getTodos() {
    return this._todoService.getTodos();
  }

  @Post()
  async createTodo(
    @Body() createTodoDto: CreateTodoDto,
  ): Promise<CreateTodoResponse> {
    return await this._todoService.createTodo(createTodoDto);
  }

  @Patch(':id')
  async updateTodo(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTodoDto: UpdateTodoDto,
  ): Promise<UpdateTodoResponse> {
    return await this._todoService.updateTodo(id, updateTodoDto);
  }

  @Delete(':id')
  async deleteTodo(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DeleteTodoResponse> {
    return await this._todoService.deleteTodo({ id });
  }

  @Get(':id')
  getTodo(@Param('id', ParseIntPipe) id: number) {
    return this._todoService.getTodo(id);
  }
}
