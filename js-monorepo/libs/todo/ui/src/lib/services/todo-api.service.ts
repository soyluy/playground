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
import { TODO_ROUTES } from '../constants/route.constants';

@Injectable()
export class TodoApiService {
  private readonly _http = inject(HttpClient);
  private readonly _apiUrl = inject(ENVIRONMENT).apiUrl;

  // TODO: Add GetTodosResponse type
  public getTodos(): Observable<TodoItem[]> {
    const url = this.urlBuilder(TODO_ROUTES.GET_ALL);
    console.log('building get todos request');
    return this._http.get<TodoItem[]>(url);
  }

  public createTodo(todo: CreateTodoDto): Observable<CreateTodoResponse> {
    const url = this.urlBuilder(TODO_ROUTES.CREATE_ONE);
    console.log('building create todo request with dto', todo);
    return this._http.post<CreateTodoResponse>(url, todo);
  }

  public updateTodo(todo: UpdateTodoDto): Observable<UpdateTodoResponse> {
    const url = this.urlBuilder(TODO_ROUTES.UPDATE_ONE(todo.id));
    console.log('building update todo request with dto', todo);
    return this._http.patch<UpdateTodoResponse>(url, todo);
  }

  public deleteTodo(id: number): Observable<DeleteTodoResponse> {
    const url = this.urlBuilder(TODO_ROUTES.DELETE_ONE(id));
    console.log('building delete todo request with id', id);
    return this._http.delete<DeleteTodoResponse>(url);
  }

  // TODO: Add GetTodoResponse type
  public getTodo(id: number): Observable<TodoItem> {
    const url = this.urlBuilder(TODO_ROUTES.GET_ONE(id));
    console.log('building get todo request with id', id);
    return this._http.get<TodoItem>(url);
  }

  private urlBuilder(path: string): string {
    return `${this._apiUrl}/${path}`;
  }
}
