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
  Query,
} from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { TodoService } from './todo.service';
import {
  CreateTodoResponse,
  UpdateTodoResponse,
  DeleteTodoResponse,
} from '@hub/todo-data';
import { GetTodoQueryParamsDto } from './dto/get-todo.dto';
import { User } from '@hub/user-api';
import { CurrentUser } from '@hub/auth-api';

@Controller('todo')
export class TodoController {
  @Inject(TodoService)
  private readonly _todoService!: TodoService;

  @Get()
  getTodos(@Query() query: GetTodoQueryParamsDto, @CurrentUser() user: User) {
    return this._todoService.getTodos(user, query);
  }

  @Post()
  async createTodo(
    @Body() createTodoDto: CreateTodoDto,
    @CurrentUser() user: User,
  ): Promise<CreateTodoResponse> {
    return await this._todoService.createTodo(user, createTodoDto);
  }

  @Patch(':id')
  async updateTodo(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTodoDto: UpdateTodoDto,
    @CurrentUser() user: User,
  ): Promise<UpdateTodoResponse> {
    return await this._todoService.updateTodo(user, id, updateTodoDto);
  }

  @Delete(':id')
  async deleteTodo(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<DeleteTodoResponse> {
    return await this._todoService.deleteTodo(user, { id });
  }

  @Get(':id')
  getTodo(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this._todoService.getTodo(user, id);
  }

  @Patch(':id/complete')
  async completeTodo(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<UpdateTodoResponse> {
    return await this._todoService.completeTodo(user, id);
  }
}
