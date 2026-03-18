import { Injectable, signal } from '@angular/core';
import { TodoItem } from '../types/todo-item.interface';

@Injectable()
export class TodoService {
  private readonly _todos = signal<TodoItem[]>([]);

  public addTodo(todo: TodoItem) {
    this._todos.update((todos) => [...todos, todo]);
  }

  public updateTodo(todo: TodoItem) {
    this._todos.update((todos) =>
      todos.map((t) => (t.id === todo.id ? todo : t)),
    );
  }

  public deleteTodo(id: string) {
    this._todos.update((todos) => todos.filter((t) => t.id !== id));
  }

  public getTodo(id: string) {
    return this._todos().find((t) => t.id === id);
  }

  public getTodos() {
    return this._todos.asReadonly();
  }
}
