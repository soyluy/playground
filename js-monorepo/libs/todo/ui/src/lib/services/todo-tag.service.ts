import {
  inject,
  Injectable,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import {
  CreateTodoTagDto,
  CreateTodoTagResponse,
  DeleteTodoTagResponse,
  TodoTag,
  UpdateTodoTagDto,
  UpdateTodoTagResponse,
} from '@hub/todo-data';
import { TagApiService } from './tag-api.service';

@Injectable({ providedIn: 'root' })
export class TodoTagService {
  private readonly _tags: WritableSignal<TodoTag[]> = signal<TodoTag[]>([]);
  private readonly _tagApiService = inject(TagApiService);

  constructor() {
    this.loadTags();
  }

  public getTags(): Signal<TodoTag[]> {
    return this._tags.asReadonly();
  }

  public addTag(tag: CreateTodoTagDto): void {
    const res$ = this._tagApiService.createTag(tag);
    res$.subscribe({
      next: (res: CreateTodoTagResponse) => {
        this._tags.update((tags) => [...tags, res]);
      },
      error: (error) => {
        console.error('error adding tag', error);
      },
    });
  }

  public updateTag(id: number, tag: UpdateTodoTagDto): void {
    const res$ = this._tagApiService.updateTag(id, tag);
    res$.subscribe({
      next: (res: UpdateTodoTagResponse) => {
        this._tags.update((tags) => tags.map((t) => (t.id === id ? res : t)));
      },
      error: (error) => {
        console.error('error updating tag', error);
      },
    });
  }

  public deleteTag(id: number): void {
    const res$ = this._tagApiService.deleteTag(id);
    res$.subscribe({
      next: (res: DeleteTodoTagResponse) => {
        this._tags.update((tags) => tags.filter((t) => t.id !== res.id));
      },
      error: (error) => {
        console.error('error deleting tag', error);
      },
    });
  }

  private async loadTags() {
    const tags$ = this._tagApiService.getTags();
    tags$.subscribe({
      next: (tags) => {
        this._tags.set(tags);
      },
      error: (error) => {
        console.error('error loading tags', error);
      },
    });
  }
}
