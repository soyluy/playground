import {
  computed,
  inject,
  Injectable,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import {
  CreateTodoResponse,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  DeleteTodoResponse,
  GetTodosResponse,
  NewTodoItem,
  TodoFilter,
  TodoItem,
  UpdateTodoDto,
  UpdateTodoResponse,
} from '@hub/todo-data';
import { TodoPersistenceService } from './todo-persistence.service';
import { TodoFilterService } from './todo-filter.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, map, switchMap, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TodoService {
  private readonly _persistenceService = inject(TodoPersistenceService);
  private readonly _filterService = inject(TodoFilterService);
  private readonly _activeFilter: Signal<TodoFilter | null> =
    this._filterService.getFilter();

  private readonly _refresh = signal(0);

  private readonly _todos: Signal<TodoItem[]>;
  private readonly _total: WritableSignal<number> = signal(0);
  private readonly _page: WritableSignal<number> = signal(DEFAULT_PAGE);
  private readonly _pageSize: WritableSignal<number> =
    signal(DEFAULT_PAGE_SIZE);

  constructor() {
    const todosResponse$ = toObservable(
      computed(() => ({
        filter: this._activeFilter(),
        _refresh: this._refresh(),
      })),
    ).pipe(
      debounceTime(300),
      switchMap(({ filter }) =>
        this._persistenceService.getTodos(filter ?? undefined),
      ),
      tap((res: GetTodosResponse) => {
        console.log('todos fetched', res);
        // TODO: Handle pagination. This approach is not ideal.
        this._total.set(res.total);
        this._page.set(res.page);
        this._pageSize.set(res.pageSize);
      }),
      map((res: GetTodosResponse) => res.data),
    );

    this._todos = toSignal(todosResponse$, { initialValue: [] });
  }

  public getTodos(): Signal<TodoItem[]> {
    return this._todos;
  }

  public addTodo(todo: NewTodoItem) {
    const res$ = this._persistenceService.saveTodo(todo);
    res$.subscribe({
      next: (res: CreateTodoResponse) => {
        this._refreshTodos();
        console.log('todo added', res);
      },
      error: (error) => {
        console.error('error adding todo', error);
      },
    });
  }

  public updateTodo(id: number, todo: UpdateTodoDto) {
    const res$ = this._persistenceService.updateTodo(id, todo);
    res$.subscribe({
      next: (res: UpdateTodoResponse) => {
        this._refreshTodos();
        console.log('todo updated', res);
      },
      error: (error) => {
        console.error('error updating todo', error);
      },
    });
  }

  public deleteTodo(id: number) {
    const res$ = this._persistenceService.deleteTodo(id);
    res$.subscribe({
      next: (res: DeleteTodoResponse) => {
        this._refreshTodos();
        console.log('todo deleted', res);
      },
      error: (error) => {
        console.error('error deleting todo', error);
      },
    });
  }

  public getTodo(id: number): TodoItem | undefined {
    return this._todos().find((t) => t.id === id);
  }

  private _refreshTodos() {
    this._refresh.update((refresh) => refresh + 1);
  }
}
