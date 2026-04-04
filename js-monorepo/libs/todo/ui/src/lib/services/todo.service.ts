import { computed, inject, Injectable, signal } from '@angular/core';
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

@Injectable({ providedIn: 'root' })
export class TodoService {
  private readonly _persistenceService = inject(TodoPersistenceService);
  private readonly _todos = signal<TodoItem[]>([]);
  private readonly _activeFilter = signal<TodoFilter>({});
  private readonly _filteredTodos = computed(() =>
    this.applyFilterAndSort(this._todos(), this._activeFilter()),
  );

  constructor() {
    this.loadTodos();
  }

  private async loadTodos() {
    const todos$ = this._persistenceService.getTodos();
    todos$.subscribe((todos) => {
      this._todos.set(todos);
    });
  }

  public addTodo(todo: NewTodoItem) {
    const res$ = this._persistenceService.saveTodo(todo);
    res$.subscribe((res: CreateTodoResponse) => {
      this._todos.update((todos) => [...todos, res]);
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
    res$.subscribe((res: UpdateTodoResponse) => {
      this._todos.update((todos) =>
        todos.map((t) => (t.id === todo.id ? res : t)),
      );
    });
  }

  public deleteTodo(id: number) {
    const res$ = this._persistenceService.deleteTodo(id);
    res$.subscribe((res: DeleteTodoResponse) => {
      this._todos.update((todos) => todos.filter((t) => t.id !== res.id));
    });
  }

  public getTodo(id: number) {
    return this._todos().find((t) => t.id === id);
  }

  public getTodos() {
    return this._filteredTodos;
  }

  public setFilter(filter: TodoFilter) {
    this._activeFilter.set(filter);
  }

  public getFilter() {
    return this._activeFilter.asReadonly();
  }

  private applyFilterAndSort(
    todos: TodoItem[],
    filter: TodoFilter,
  ): TodoItem[] {
    const filteredTodos = todos.filter((todo) =>
      this.matchesFilter(todo, filter),
    );
    return this.sortTodos(filteredTodos, filter);
  }

  private matchesFilter(todo: TodoItem, filter: TodoFilter): boolean {
    if (filter.search) {
      const title = todo.title ?? '';
      const description = todo.description ?? '';
      const combinedText = `${title} ${description}`;
      const isMatch = this.matchesSearch(combinedText, filter.search);
      if (!isMatch) {
        return false;
      }
    }

    const todoTagIds = (todo.tags ?? []).map((tag) => tag.id);

    if (
      filter.tags &&
      filter.tags.length > 0 &&
      !filter.tags.some((tagId) => todoTagIds.includes(tagId))
    ) {
      return false;
    }

    if (
      filter.allIncludeTags &&
      filter.allIncludeTags.length > 0 &&
      !filter.allIncludeTags.every((tagId) => todoTagIds.includes(tagId))
    ) {
      return false;
    }

    if (
      filter.allExcludeTags &&
      filter.allExcludeTags.length > 0 &&
      filter.allExcludeTags.some((tagId) => todoTagIds.includes(tagId))
    ) {
      return false;
    }

    if (filter.completed !== undefined && todo.completed !== filter.completed) {
      return false;
    }

    if (filter.dueDateBefore) {
      const todoDueDate = this.toDate(todo.dueDate);
      if (!todoDueDate || todoDueDate >= filter.dueDateBefore) {
        return false;
      }
    }

    if (filter.dueDateAfter) {
      const todoDueDate = this.toDate(todo.dueDate);
      if (!todoDueDate || todoDueDate <= filter.dueDateAfter) {
        return false;
      }
    }

    return true;
  }

  private matchesSearch(value: string, searchTerm: string): boolean {
    try {
      const regex = new RegExp(searchTerm, 'i');
      return regex.test(value);
    } catch {
      return value.toLowerCase().includes(searchTerm.toLowerCase());
    }
  }

  private sortTodos(todos: TodoItem[], filter: TodoFilter): TodoItem[] {
    if (!filter.sortBy) {
      return todos;
    }

    const direction = filter.sortOrder === 'desc' ? -1 : 1;
    return [...todos].sort((a, b) => {
      switch (filter.sortBy) {
        case 'title':
          return a.title.localeCompare(b.title) * direction;
        case 'dueDate':
          return this.compareDates(a.dueDate, b.dueDate) * direction;
        case 'createdAt':
          return this.compareDates(a.createdAt, b.createdAt) * direction;
        case 'updatedAt':
          return this.compareDates(a.updatedAt, b.updatedAt) * direction;
        default:
          return 0;
      }
    });
  }

  private compareDates(
    left: Date | string | null | undefined,
    right: Date | string | null | undefined,
  ): number {
    const leftDate = this.toDate(left);
    const rightDate = this.toDate(right);

    if (!leftDate && !rightDate) {
      return 0;
    }
    if (!leftDate) {
      return 1;
    }
    if (!rightDate) {
      return -1;
    }
    return leftDate.getTime() - rightDate.getTime();
  }

  private toDate(value: Date | string | null | undefined): Date | null {
    if (!value) {
      return null;
    }
    if (value instanceof Date) {
      return value;
    }

    const parsedValue = new Date(value);
    return Number.isNaN(parsedValue.getTime()) ? null : parsedValue;
  }
}
