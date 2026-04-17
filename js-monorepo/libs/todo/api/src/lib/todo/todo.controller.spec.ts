import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';
import { User } from '@hub/user-api';
import { GetTodoQueryParamsDto } from './dto/get-todo.dto';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@hub/todo-data';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeUser = (overrides: Partial<User> = {}): User => ({
  id: 1,
  email: 'alice@example.com',
  ...overrides,
});

const makeTodo = (overrides = {}) => ({
  id: 1,
  title: 'Buy milk',
  completed: false,
  description: null,
  dueDate: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  tags: [],
  ...overrides,
});

// ---------------------------------------------------------------------------
// TodoService mock — only the methods the controller calls
// ---------------------------------------------------------------------------

const makeTodoServiceMock = () => ({
  getTodos: jest.fn(),
  getTodo: jest.fn(),
  createTodo: jest.fn(),
  updateTodo: jest.fn(),
  deleteTodo: jest.fn(),
  completeTodo: jest.fn(),
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('TodoController', () => {
  let controller: TodoController;
  let todoService: ReturnType<typeof makeTodoServiceMock>;

  beforeEach(async () => {
    todoService = makeTodoServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodoController],
      providers: [{ provide: TodoService, useValue: todoService }],
    }).compile();

    controller = module.get(TodoController);
  });

  // -------------------------------------------------------------------------
  // getTodos
  // -------------------------------------------------------------------------

  describe('getTodos', () => {
    it('delegates to TodoService and returns the result', async () => {
      const user = makeUser();
      const query: GetTodoQueryParamsDto = {};
      const expected = { data: [makeTodo()], total: 1, page: DEFAULT_PAGE, pageSize: DEFAULT_PAGE_SIZE };
      todoService.getTodos.mockResolvedValue(expected);

      const result = await controller.getTodos(query, user);

      expect(result).toEqual(expected);
      expect(todoService.getTodos).toHaveBeenCalledWith(user, query);
    });
  });

  // -------------------------------------------------------------------------
  // getTodo
  // -------------------------------------------------------------------------

  describe('getTodo', () => {
    it('delegates to TodoService with the parsed id', async () => {
      const user = makeUser();
      const todo = makeTodo();
      todoService.getTodo.mockResolvedValue(todo);

      const result = await controller.getTodo(1, user);

      expect(result).toEqual(todo);
      expect(todoService.getTodo).toHaveBeenCalledWith(user, 1);
    });
  });

  // -------------------------------------------------------------------------
  // createTodo
  // -------------------------------------------------------------------------

  describe('createTodo', () => {
    it('delegates to TodoService and returns the created todo', async () => {
      const user = makeUser();
      const dto = {
        title: 'Buy milk',
        description: null,
        dueDate: null,
        completed: false,
        tagIds: [],
      };
      const created = makeTodo();
      todoService.createTodo.mockResolvedValue(created);

      const result = await controller.createTodo(dto, user);

      expect(result).toEqual(created);
      expect(todoService.createTodo).toHaveBeenCalledWith(user, dto);
    });
  });

  // -------------------------------------------------------------------------
  // updateTodo
  // -------------------------------------------------------------------------

  describe('updateTodo', () => {
    it('delegates to TodoService with the id and update data', async () => {
      const user = makeUser();
      const dto = { title: 'Updated', description: null, dueDate: null, completed: null, tagIds: null };
      const updated = makeTodo({ title: 'Updated' });
      todoService.updateTodo.mockResolvedValue(updated);

      const result = await controller.updateTodo(1, dto, user);

      expect(result).toEqual(updated);
      expect(todoService.updateTodo).toHaveBeenCalledWith(user, 1, dto);
    });
  });

  // -------------------------------------------------------------------------
  // deleteTodo
  // -------------------------------------------------------------------------

  describe('deleteTodo', () => {
    it('delegates to TodoService with the id and returns the deleted todo', async () => {
      const user = makeUser();
      const deleted = makeTodo();
      todoService.deleteTodo.mockResolvedValue(deleted);

      const result = await controller.deleteTodo(1, user);

      expect(result).toEqual(deleted);
      expect(todoService.deleteTodo).toHaveBeenCalledWith(user, { id: 1 });
    });
  });

  // -------------------------------------------------------------------------
  // completeTodo
  // -------------------------------------------------------------------------

  describe('completeTodo', () => {
    it('delegates to TodoService and returns the toggled todo', async () => {
      const user = makeUser();
      const toggled = makeTodo({ completed: true });
      todoService.completeTodo.mockResolvedValue(toggled);

      const result = await controller.completeTodo(1, user);

      expect(result).toEqual(toggled);
      expect(todoService.completeTodo).toHaveBeenCalledWith(user, 1);
    });
  });
});
