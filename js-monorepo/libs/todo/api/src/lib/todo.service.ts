import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@hub/prisma';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { DeleteTodoDto } from '@hub/todo-data';

@Injectable()
export class TodoService {
  @Inject(PrismaService)
  private readonly _prismaService!: PrismaService;

  async createTodo(createTodoDto: CreateTodoDto) {
    return this._prismaService.todo.create({
      data: createTodoDto,
    });
  }

  async getTodos() {
    return this._prismaService.todo.findMany();
  }

  async getTodo(id: number) {
    return this._prismaService.todo.findUnique({
      where: { id },
    });
  }

  async updateTodo(id: number, updateTodoDto: UpdateTodoDto) {
    return this._prismaService.todo.update({
      where: { id },
      data: {
        ...updateTodoDto,
      },
    });
  }

  async deleteTodo(deleteTodoDto: DeleteTodoDto) {
    return this._prismaService.todo.delete({
      where: { id: deleteTodoDto.id },
    });
  }

  async completeTodo(id: number) {
    const todo = await this._prismaService.todo.findUnique({
      where: { id },
    });
    if (!todo) {
      throw new NotFoundException('Todo not found');
    }
    return this._prismaService.todo.update({
      where: { id },
      data: { completed: !todo.completed },
    });
  }
}
