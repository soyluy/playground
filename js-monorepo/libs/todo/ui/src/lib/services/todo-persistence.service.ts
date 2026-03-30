import { inject, Injectable } from '@angular/core';
import {
  CreateTodoResponse,
  DeleteTodoResponse,
  NewTodoItem,
  TodoItem,
  UpdateTodoDto,
  UpdateTodoResponse,
} from '@hub/todo-data';
import { TodoApiService } from './todo-api.service';
import { Observable, tap } from 'rxjs';

@Injectable()
export class TodoPersistenceService {
  private readonly _apiService = inject(TodoApiService);

  public saveTodo(todo: NewTodoItem): Observable<TodoItem> {
    const res$ = this._apiService.createTodo(todo);
    res$.pipe(
      tap((res: CreateTodoResponse) => {
        console.log('todo saved');
        console.log(res);
      }),
    );
    return res$;
  }

  public updateTodo(todo: UpdateTodoDto): Observable<UpdateTodoResponse> {
    const res$ = this._apiService.updateTodo(todo);
    res$.pipe(
      tap((res: UpdateTodoResponse) => {
        console.log('todo updated');
        console.log(res);
      }),
    );
    return res$;
  }

  public deleteTodo(id: number): Observable<DeleteTodoResponse> {
    const res$ = this._apiService.deleteTodo(id);
    res$.pipe(
      tap((res: DeleteTodoResponse) => {
        console.log('todo deleted');
        console.log(res);
      }),
    );
    return res$;
  }

  public getTodos(): Observable<TodoItem[]> {
    const res$ = this._apiService.getTodos();
    res$.pipe(
      tap((res: TodoItem[]) => {
        console.log('todos fetched');
        console.log(res);
      }),
    );
    return res$;
  }
}
