import { Injectable, Signal, computed, signal } from '@angular/core';
import { TodoFilter } from '@hub/todo-data';

@Injectable({ providedIn: 'root' })
export class TodoFilterService {
  private readonly _filter = signal<TodoFilter | null>(null);
  private readonly _filterCount = computed(() => {
    let count = 0;
    const filter = this._filter();
    for (const key in filter) {
      if (filter[key as keyof TodoFilter]) count += 1;
    }
    return count;
  });

  public getFilterCount(): Signal<number> {
    return this._filterCount;
  }

  public getFilter(): Signal<TodoFilter | null> {
    return this._filter.asReadonly();
  }

  public setFilter(filter: TodoFilter): void {
    this._filter.set(filter);
  }
}
