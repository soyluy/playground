import { inject, Injectable } from '@angular/core';
import {
  CreateTodoDto,
  CreateTodoResponse,
  DeleteTodoResponse,
  NewTodoItem,
  TodoFilter,
  TodoItem,
  UpdateTodoDto,
  UpdateTodoResponse,
} from '@hub/todo-data';
import { TodoApiService } from './todo-api.service';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TodoPersistenceService {
  private readonly _apiService = inject(TodoApiService);

  public saveTodo(todo: NewTodoItem): Observable<TodoItem> {
    console.log('saving todo', todo);
    const dto: CreateTodoDto = {
      title: todo.title,
      description: todo.description,
      dueDate: todo.dueDate,
      completed: todo.completed,
      tagIds: todo.tags !== null ? todo.tags.map((tag) => tag.id) : [],
    };
    const res$ = this._apiService.createTodo(dto);
    return res$.pipe(
      tap((res: CreateTodoResponse) => {
        console.log('todo saved');
        console.log(res);
      }),
    );
  }

  public updateTodo(todo: UpdateTodoDto): Observable<UpdateTodoResponse> {
    const res$ = this._apiService.updateTodo(todo);

    return res$.pipe(
      tap((res: UpdateTodoResponse) => {
        console.log('todo updated');
        console.log(res);
      }),
    );
  }

  public deleteTodo(id: number): Observable<DeleteTodoResponse> {
    const res$ = this._apiService.deleteTodo(id);
    return res$.pipe(
      tap((res: DeleteTodoResponse) => {
        console.log('todo deleted');
        console.log(res);
      }),
    );
  }

  public getTodos(filter?: TodoFilter): Observable<TodoItem[]> {
    const res$ = this._apiService.getTodos(filter);
    return res$.pipe(
      tap((res: TodoItem[]) => {
        console.log('todos fetched');
        console.log(res);
      }),
    );
  }
}
