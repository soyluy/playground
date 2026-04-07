import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import {
  CreateTodoResponse,
  DeleteTodoResponse,
  NewTodoItem,
  TodoFilter,
  TodoItem,
  UpdateTodoDto,
  UpdateTodoResponse,
} from '@hub/todo-data';
import { TodoPersistenceService } from './todo-persistence.service';
import { TodoFilterService } from './todo-filter.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TodoService {
  private readonly _persistenceService = inject(TodoPersistenceService);
  private readonly _filterService = inject(TodoFilterService);
  private readonly _activeFilter: Signal<TodoFilter | null> =
    this._filterService.getFilter();

  private readonly _refresh = signal(0);

  private readonly _todos: Signal<TodoItem[]>;

  constructor() {
    const todos$ = toObservable(
      computed(() => ({
        filter: this._activeFilter(),
        _refresh: this._refresh(),
      })),
    ).pipe(
      debounceTime(300),
      switchMap(({ filter }) =>
        this._persistenceService.getTodos(filter ?? undefined),
      ),
    );

    this._todos = toSignal(todos$, { initialValue: [] }) as Signal<TodoItem[]>;
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

  public updateTodo(todo: TodoItem) {
    const dto: UpdateTodoDto = {
      id: todo.id,
      title: todo.title,
      dueDate: todo.dueDate,
      description: todo.description,
      completed: todo.completed,
      tagIds: todo.tags !== null ? todo.tags.map((t) => t.id) : null,
    };
    const res$ = this._persistenceService.updateTodo(dto);
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
