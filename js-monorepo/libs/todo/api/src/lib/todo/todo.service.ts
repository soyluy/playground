import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@hub/prisma';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { DeleteTodoDto, TodoItem } from '@hub/todo-data';
import { Prisma } from '@hub/prisma';

@Injectable()
export class TodoService {
  @Inject(PrismaService)
  private readonly _prismaService!: PrismaService;

  async createTodo(createTodoDto: CreateTodoDto): Promise<TodoItem> {
    const { tagIds, ...data } = createTodoDto;
    return this._prismaService.todo.create({
      data: {
        title: data.title,
        description: data.description ?? undefined,
        completed: data.completed,
        tags: {
          connect: tagIds.map((id) => ({ id })),
        },
      },
      include: {
        tags: true,
      },
    });
  }

  async getTodos() {
    return this._prismaService.todo.findMany({
      select: {
        id: true,
        title: true,
        completed: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        tags: {
          select: {
            id: true,
            name: true,
            colorHex: true,
          },
        },
      },
    });
  }

  async getTodo(id: number) {
    return this._prismaService.todo.findUnique({
      where: { id },
      include: {
        tags: true,
      },
    });
  }

  async updateTodo(
    id: number,
    updateTodoDto: UpdateTodoDto,
  ): Promise<TodoItem> {
    const { tagIds, ...rest } = updateTodoDto;
    const data: Prisma.TodoUpdateInput = {
      title: rest.title ?? undefined,
      description: rest.description ?? undefined,
      completed: rest.completed ?? undefined,
    };
    if (tagIds !== null) {
      data.tags = {
        set: tagIds.map((id) => ({ id })),
      };
    }
    return this._prismaService.todo.update({
      where: { id },
      data: data,
      include: {
        tags: true,
      },
    });
  }

  async deleteTodo(deleteTodoDto: DeleteTodoDto) {
    return this._prismaService.todo.delete({
      where: { id: deleteTodoDto.id },
      include: { tags: true },
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
