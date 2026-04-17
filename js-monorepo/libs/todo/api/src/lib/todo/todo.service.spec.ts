import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TodoService } from './todo.service';
import { PrismaService } from '@hub/prisma';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@hub/todo-data';
import { User } from '@hub/user-api';
import { GetTodoQueryParamsDto } from './dto/get-todo.dto';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeUser = (overrides: Partial<User> = {}): User => ({
  id: 1,
  email: 'alice@example.com',
  ...overrides,
});

const makeTag = (id = 1) => ({ id, name: 'Work', colorHex: '#ff0000' });

const makeTodo = (overrides = {}) => ({
  id: 1,
  title: 'Buy milk',
  completed: false,
  description: null,
  dueDate: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  tags: [],
  ownerId: 1,
  ...overrides,
});

// ---------------------------------------------------------------------------
// Prisma mock factory
// ---------------------------------------------------------------------------

const makePrismaMock = () => ({
  todo: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('TodoService', () => {
  let service: TodoService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(async () => {
    prisma = makePrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(TodoService);
  });

  // -------------------------------------------------------------------------
  // createTodo
  // -------------------------------------------------------------------------

  describe('createTodo', () => {
    it('creates a todo and returns the created item', async () => {
      const user = makeUser();
      const dto = {
        title: 'Buy milk',
        description: null,
        dueDate: null,
        completed: false,
        tagIds: [],
      };
      const expected = makeTodo();
      prisma.todo.create.mockResolvedValue(expected);

      const result = await service.createTodo(user, dto);

      expect(result).toEqual(expected);
      expect(prisma.todo.create).toHaveBeenCalledWith({
        data: {
          ownerId: user.id,
          title: dto.title,
          description: undefined,
          dueDate: undefined,
          completed: dto.completed,
          tags: { connect: [] },
        },
        include: { tags: true },
      });
    });

    it('connects the provided tag IDs to the new todo', async () => {
      const user = makeUser();
      const dto = {
        title: 'Tag test',
        description: null,
        dueDate: null,
        completed: false,
        tagIds: [10, 20],
      };
      prisma.todo.create.mockResolvedValue(makeTodo({ tags: [makeTag(10), makeTag(20)] }));

      await service.createTodo(user, dto);

      const connectArg = prisma.todo.create.mock.calls[0][0].data.tags.connect;
      expect(connectArg).toEqual([
        { id: 10, ownerId: user.id },
        { id: 20, ownerId: user.id },
      ]);
    });
  });

  // -------------------------------------------------------------------------
  // getTodos
  // -------------------------------------------------------------------------

  describe('getTodos', () => {
    it('returns todos with total count and pagination defaults', async () => {
      const user = makeUser();
      const query: GetTodoQueryParamsDto = {};
      const todos = [makeTodo()];
      prisma.todo.findMany.mockResolvedValue(todos);
      prisma.todo.count.mockResolvedValue(1);

      const result = await service.getTodos(user, query);

      expect(result).toEqual({
        data: todos,
        total: 1,
        page: DEFAULT_PAGE,
        pageSize: DEFAULT_PAGE_SIZE,
      });
    });

    it('applies skip/take when page and pageSize are given', async () => {
      const user = makeUser();
      const query: GetTodoQueryParamsDto = { page: 2, pageSize: 5 };
      prisma.todo.findMany.mockResolvedValue([]);
      prisma.todo.count.mockResolvedValue(0);

      await service.getTodos(user, query);

      expect(prisma.todo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 5, take: 5 }),
      );
    });

    it('filters todos by search term (case-insensitive)', async () => {
      const user = makeUser();
      const query: GetTodoQueryParamsDto = { search: 'milk' };
      prisma.todo.findMany.mockResolvedValue([]);
      prisma.todo.count.mockResolvedValue(0);

      await service.getTodos(user, query);

      expect(prisma.todo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            title: { contains: 'milk', mode: 'insensitive' },
          }),
        }),
      );
    });

    it('filters todos by completed status', async () => {
      const user = makeUser();
      const query: GetTodoQueryParamsDto = { completed: true };
      prisma.todo.findMany.mockResolvedValue([]);
      prisma.todo.count.mockResolvedValue(0);

      await service.getTodos(user, query);

      expect(prisma.todo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ completed: true }),
        }),
      );
    });

    it('applies sortBy and sortOrder to the query', async () => {
      const user = makeUser();
      const query: GetTodoQueryParamsDto = { sortBy: 'dueDate', sortOrder: 'desc' };
      prisma.todo.findMany.mockResolvedValue([]);
      prisma.todo.count.mockResolvedValue(0);

      await service.getTodos(user, query);

      expect(prisma.todo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { dueDate: 'desc' } }),
      );
    });

    it('filters by dueDateBefore and dueDateAfter', async () => {
      const user = makeUser();
      const before = new Date('2025-06-01');
      const after = new Date('2025-01-01');
      const query: GetTodoQueryParamsDto = { dueDateBefore: before, dueDateAfter: after };
      prisma.todo.findMany.mockResolvedValue([]);
      prisma.todo.count.mockResolvedValue(0);

      await service.getTodos(user, query);

      expect(prisma.todo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            dueDate: { lt: before, gt: after },
          }),
        }),
      );
    });

    it('scopes todos to the current user', async () => {
      const user = makeUser({ id: 42 });
      const query: GetTodoQueryParamsDto = {};
      prisma.todo.findMany.mockResolvedValue([]);
      prisma.todo.count.mockResolvedValue(0);

      await service.getTodos(user, query);

      expect(prisma.todo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ ownerId: 42 }),
        }),
      );
    });
  });

  // -------------------------------------------------------------------------
  // getTodo
  // -------------------------------------------------------------------------

  describe('getTodo', () => {
    it('returns the matching todo for the user', async () => {
      const user = makeUser();
      const todo = makeTodo();
      prisma.todo.findUnique.mockResolvedValue(todo);

      const result = await service.getTodo(user, 1);

      expect(result).toEqual(todo);
      expect(prisma.todo.findUnique).toHaveBeenCalledWith({
        where: { id: 1, ownerId: user.id },
        include: { tags: true },
      });
    });

    it('returns null when the todo does not exist', async () => {
      prisma.todo.findUnique.mockResolvedValue(null);

      const result = await service.getTodo(makeUser(), 999);

      expect(result).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // updateTodo
  // -------------------------------------------------------------------------

  describe('updateTodo', () => {
    it('updates and returns the todo', async () => {
      const user = makeUser();
      const dto = { title: 'Updated', description: null, dueDate: null, completed: null, tagIds: null };
      const updated = makeTodo({ title: 'Updated' });
      prisma.todo.update.mockResolvedValue(updated);

      const result = await service.updateTodo(user, 1, dto);

      expect(result).toEqual(updated);
    });

    it('sets the tag relation when tagIds are provided', async () => {
      const user = makeUser();
      const dto = { title: null, description: null, dueDate: null, completed: null, tagIds: [5] };
      prisma.todo.update.mockResolvedValue(makeTodo());

      await service.updateTodo(user, 1, dto);

      const updateData = prisma.todo.update.mock.calls[0][0].data;
      expect(updateData.tags).toEqual({ set: [{ id: 5 }] });
    });

    it('does not set the tag relation when tagIds is null', async () => {
      const user = makeUser();
      const dto = { title: 'New title', description: null, dueDate: null, completed: null, tagIds: null };
      prisma.todo.update.mockResolvedValue(makeTodo());

      await service.updateTodo(user, 1, dto);

      const updateData = prisma.todo.update.mock.calls[0][0].data;
      expect(updateData.tags).toBeUndefined();
    });
  });

  // -------------------------------------------------------------------------
  // deleteTodo
  // -------------------------------------------------------------------------

  describe('deleteTodo', () => {
    it('deletes and returns the deleted todo', async () => {
      const user = makeUser();
      const deleted = makeTodo();
      prisma.todo.delete.mockResolvedValue(deleted);

      const result = await service.deleteTodo(user, { id: 1 });

      expect(result).toEqual(deleted);
      expect(prisma.todo.delete).toHaveBeenCalledWith({
        where: { id: 1, ownerId: user.id },
        include: { tags: true },
      });
    });
  });

  // -------------------------------------------------------------------------
  // completeTodo
  // -------------------------------------------------------------------------

  describe('completeTodo', () => {
    it('toggles completed from false to true', async () => {
      const user = makeUser();
      const todo = makeTodo({ completed: false });
      prisma.todo.findUnique.mockResolvedValue(todo);
      prisma.todo.update.mockResolvedValue({ ...todo, completed: true });

      const result = await service.completeTodo(user, 1);

      expect(result.completed).toBe(true);
      expect(prisma.todo.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { completed: true },
        }),
      );
    });

    it('toggles completed from true to false', async () => {
      const user = makeUser();
      const todo = makeTodo({ completed: true });
      prisma.todo.findUnique.mockResolvedValue(todo);
      prisma.todo.update.mockResolvedValue({ ...todo, completed: false });

      const result = await service.completeTodo(user, 1);

      expect(result.completed).toBe(false);
    });

    it('throws NotFoundException when the todo does not exist', async () => {
      prisma.todo.findUnique.mockResolvedValue(null);

      await expect(service.completeTodo(makeUser(), 999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
