import { inject, Injectable, signal } from '@angular/core';
import {
  CreateTodoResponse,
  DeleteTodoResponse,
  NewTodoItem,
  TodoItem,
  UpdateTodoDto,
  UpdateTodoResponse,
} from '@hub/todo-data';
import { TodoPersistenceService } from './todo-persistence.service';

@Injectable()
export class TodoService {
  private readonly _persistenceService = inject(TodoPersistenceService);
  private readonly _todos = signal<TodoItem[]>([]);

  constructor() {
    this.loadTodos();
  }

  private async loadTodos() {
    const todos$ = this._persistenceService.getTodos();
    todos$.subscribe((todos) => {
      this._todos.set(todos);
    });
  }

  public addTodo(todo: NewTodoItem) {
    const res$ = this._persistenceService.saveTodo(todo);
    res$.subscribe((res: CreateTodoResponse) => {
      this._todos.update((todos) => [...todos, res]);
    });
  }

  public updateTodo(todo: TodoItem) {
    const dto: UpdateTodoDto = {
      id: todo.id,
      title: todo.title,
      description: todo.description,
      completed: todo.completed,
      tagIds: todo.tags !== null ? todo.tags.map((t) => t.id) : null,
    };
    const res$ = this._persistenceService.updateTodo(dto);
    res$.subscribe((res: UpdateTodoResponse) => {
      this._todos.update((todos) =>
        todos.map((t) => (t.id === todo.id ? res : t)),
      );
    });
  }

  public deleteTodo(id: number) {
    const res$ = this._persistenceService.deleteTodo(id);
    res$.subscribe((res: DeleteTodoResponse) => {
      this._todos.update((todos) => todos.filter((t) => t.id !== res.id));
    });
  }

  public getTodo(id: number) {
    return this._todos().find((t) => t.id === id);
  }

  public getTodos() {
    return this._todos.asReadonly();
  }
}
