import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ENVIRONMENT } from '../tokens/environment.token';
import {
  CreateTodoDto,
  CreateTodoResponse,
  DeleteTodoResponse,
  TodoItem,
  UpdateTodoDto,
  UpdateTodoResponse,
} from '@hub/todo-data';
import { Observable } from 'rxjs';

@Injectable()
export class TodoApiService {
  private readonly _http = inject(HttpClient);
  private readonly _apiUrl = inject(ENVIRONMENT).apiUrl;

  // TODO: Add GetTodosResponse type
  public getTodos(): Observable<TodoItem[]> {
    return this._http.get<TodoItem[]>(`${this._apiUrl}/todos`);
  }

  public createTodo(todo: CreateTodoDto): Observable<CreateTodoResponse> {
    return this._http.post<CreateTodoResponse>(`${this._apiUrl}/todos`, todo);
  }

  public updateTodo(todo: UpdateTodoDto): Observable<UpdateTodoResponse> {
    return this._http.put<UpdateTodoResponse>(
      `${this._apiUrl}/todos/${todo.id}`,
      todo,
    );
  }

  public deleteTodo(id: number): Observable<DeleteTodoResponse> {
    return this._http.delete<DeleteTodoResponse>(`${this._apiUrl}/todos/${id}`);
  }

  // TODO: Add GetTodoResponse type
  public getTodo(id: number): Observable<TodoItem> {
    return this._http.get<TodoItem>(`${this._apiUrl}/todos/${id}`);
  }
}
