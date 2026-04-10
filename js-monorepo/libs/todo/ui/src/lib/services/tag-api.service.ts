import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  CreateTodoTagDto,
  DeleteTodoTagResponse,
  TodoTag,
  UpdateTodoTagDto,
  UpdateTodoTagResponse,
} from '@hub/todo-data';
import { ENVIRONMENT } from '@hub/ui-infra';
import { Observable } from 'rxjs';
import { TAG_ROUTES } from '../constants/route.constants';

@Injectable({ providedIn: 'root' })
export class TagApiService {
  private readonly _http = inject(HttpClient);
  private readonly _apiUrl = inject(ENVIRONMENT).apiUrl;

  public getTags(): Observable<TodoTag[]> {
    const url = this.urlBuilder(TAG_ROUTES.GET_ALL);
    return this._http.get<TodoTag[]>(url);
  }

  public createTag(tag: CreateTodoTagDto): Observable<TodoTag> {
    const url = this.urlBuilder(TAG_ROUTES.CREATE_ONE);
    return this._http.post<TodoTag>(url, tag);
  }

  public updateTag(
    id: number,
    tag: UpdateTodoTagDto,
  ): Observable<UpdateTodoTagResponse> {
    const url = this.urlBuilder(TAG_ROUTES.UPDATE_ONE(id));
    return this._http.patch<UpdateTodoTagResponse>(url, tag);
  }

  public deleteTag(id: number): Observable<DeleteTodoTagResponse> {
    const url = this.urlBuilder(TAG_ROUTES.DELETE_ONE(id));
    return this._http.delete<DeleteTodoTagResponse>(url);
  }

  private urlBuilder(path: string): string {
    return `${this._apiUrl}/${path}`;
  }
}
