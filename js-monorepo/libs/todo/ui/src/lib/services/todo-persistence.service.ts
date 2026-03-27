import { Injectable } from '@angular/core';
import { TodoItem } from '@hub/todo-data';

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

  public updateTodo(todo: TodoItem): void {
    try {
      const todos = this.getTodos();
      const index = todos.findIndex((t) => t.id === todo.id);
      if (index !== -1) {
        todos[index] = todo;
      }
      this.saveTodos(todos);
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  }

  public deleteTodo(id: number): void {
    try {
      const todos = this.getTodos();
      const index = todos.findIndex((t) => t.id === id);
      if (index !== -1) {
        todos.splice(index, 1);
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
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
