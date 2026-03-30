import { inject, Injectable, signal } from '@angular/core';
import { TodoItem } from '@hub/todo-data';
import { TodoPersistenceService } from './todo-persistence.service';

@Injectable()
export class TodoService {
  private readonly _persistenceService = inject(TodoPersistenceService);
  private readonly _todos = signal<TodoItem[]>([]);

  constructor() {
    this.loadTodos();
  }

  private async loadTodos() {
    this._todos.set(await this._persistenceService.getTodos());
  }

  public addTodo(todo: TodoItem) {
    this._todos.update((todos) => [...todos, todo]);
    this._persistenceService.saveTodo(todo);
  }

  public updateTodo(todo: TodoItem) {
    this._todos.update((todos) =>
      todos.map((t) => (t.id === todo.id ? todo : t)),
    );
    this._persistenceService.updateTodo(todo);
  }

  public deleteTodo(id: number) {
    this._todos.update((todos) => todos.filter((t) => t.id !== id));
    this._persistenceService.deleteTodo(id);
  }

  public getTodo(id: number) {
    return this._todos().find((t) => t.id === id);
  }

  public getTodos() {
    return this._todos.asReadonly();
  }
}
