import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@hub/prisma';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  DeleteTodoDto,
  GetTodoQueryParamsDto,
  GetTodosResponse,
  PaginationDto,
  TodoItem,
} from '@hub/todo-data';
import { Prisma } from '@hub/prisma';
import { TodoFilter } from '@hub/todo-data';

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
        dueDate: data.dueDate ?? undefined,
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

  async getTodos(query: GetTodoQueryParamsDto): Promise<GetTodosResponse> {
    const pagination = this.buildPagination(query);

    const where: Prisma.TodoWhereInput = this.buildWhere(query);
    const orderBy: Prisma.TodoOrderByWithRelationInput | undefined =
      this.buildOrderBy(query);

    const todos = await this._prismaService.todo.findMany({
      select: {
        id: true,
        title: true,
        completed: true,
        dueDate: true,
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
      where,
      orderBy,
      ...pagination,
    });

    const total = await this._prismaService.todo.count({
      where,
    });

    return {
      data: todos,
      total,
      page: query.page ?? DEFAULT_PAGE,
      pageSize: query.pageSize ?? DEFAULT_PAGE_SIZE,
    };
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
      dueDate: rest.dueDate ?? undefined,
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

  async completeTodo(id: number): Promise<TodoItem> {
    const todo = await this._prismaService.todo.findUnique({
      where: { id },
    });
    if (!todo) {
      throw new NotFoundException('Todo not found');
    }
    return this._prismaService.todo.update({
      where: { id },
      data: { completed: !todo.completed },
      include: { tags: true },
    });
  }

  private buildPagination(
    query: PaginationDto,
  ): { skip: number; take: number } | undefined {
    if (query.page && query.pageSize) {
      return {
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      };
    }
    return undefined;
  }

  private buildWhere(
    query: Omit<TodoFilter, 'sortBy' | 'sortOrder'>,
  ): Prisma.TodoWhereInput {
    const where: Prisma.TodoWhereInput = {};
    if (query.search) {
      where.title = { contains: query.search, mode: 'insensitive' };
    }
    const tagsAnd: Prisma.TodoWhereInput[] = [];
    if (query.tags) {
      tagsAnd.push({ tags: { some: { id: { in: query.tags } } } });
    }
    if (query.allIncludeTags) {
      tagsAnd.push({ tags: { every: { id: { in: query.allIncludeTags } } } });
    }
    if (query.allExcludeTags) {
      tagsAnd.push({ tags: { none: { id: { in: query.allExcludeTags } } } });
    }
    if (tagsAnd.length > 0) {
      where.AND = tagsAnd;
    }
    if (query.completed) {
      where.completed = query.completed;
    }
    if (query.dueDateBefore || query.dueDateAfter) {
      where.dueDate = {
        ...(query.dueDateBefore && { lt: query.dueDateBefore }),
        ...(query.dueDateAfter && { gt: query.dueDateAfter }),
      };
    }
    return where;
  }

  private buildOrderBy(
    query: TodoFilter,
  ): Prisma.TodoOrderByWithRelationInput | undefined {
    if (query.sortBy) {
      return { [query.sortBy]: query.sortOrder ?? 'asc' };
    }
    return undefined;
  }
}
