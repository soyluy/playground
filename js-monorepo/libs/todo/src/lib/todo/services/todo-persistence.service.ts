import { Injectable } from '@angular/core';
import { TodoItem } from '../types/todo-item.interface';

@Injectable()
export class TodoPersistenceService {
  private readonly lsKey = 'todos';

  public saveTodos(todos: TodoItem[]): void {
    try {
      localStorage.setItem(this.lsKey, JSON.stringify(todos));
    } catch (error) {
      console.error('Error saving todos:', error);
    }
  }

  public saveTodo(todo: TodoItem): void {
    try {
      const todos = this.getTodos();
      todos.push(todo);
      this.saveTodos(todos);
    } catch (error) {
      console.error('Error saving todo:', error);
    }
  }

  public getTodos(): TodoItem[] {
    try {
      const todos = localStorage.getItem(this.lsKey);
      return todos ? JSON.parse(todos) : [];
    } catch (error) {
      console.error('Error getting todos:', error);
      return [];
    }
  }
}
