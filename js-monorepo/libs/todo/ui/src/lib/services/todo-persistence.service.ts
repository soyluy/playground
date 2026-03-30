import { inject, Injectable } from '@angular/core';
import { TodoItem } from '@hub/todo-data';
import { TodoApiService } from './todo-api.service';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TodoPersistenceService {
  private readonly _apiService = inject(TodoApiService);

  public saveTodos(todos: TodoItem[]): void {
    for (const todo of todos) {
      const res = this._apiService.createTodo(todo);
      res.subscribe((res) => {
        console.log('todos saved');
        console.log(res);
      });
    }
  }

  public saveTodo(todo: TodoItem): void {
    const res = this._apiService.createTodo(todo);
    res.subscribe((res) => {
      console.log('todo saved');
      console.log(res);
    });
  }

  public updateTodo(todo: TodoItem): void {
    const res = this._apiService.updateTodo(todo);
    res.subscribe((res) => {
      console.log('todo updated');
      console.log(res);
    });
  }

  public deleteTodo(id: number): void {
    const res = this._apiService.deleteTodo(id);
    res.subscribe((res) => {
      console.log('todo deleted');
      console.log(res);
    });
  }

  public async getTodos(): Promise<TodoItem[]> {
    const resObservable = this._apiService.getTodos();
    const resPromise = firstValueFrom(resObservable);
    return await resPromise;
  }
}
