import { Injectable, Signal, computed, signal } from '@angular/core';
import { ResourceFilter } from '../constants/ui.constants';

@Injectable({ providedIn: 'root' })
export class ResourceFilterService {
  private readonly _filter = signal<ResourceFilter | null>(null);
  private readonly _filterCount = computed(() => {
    let count = 0;
    const filter = this._filter();
    for (const key in filter) {
      if (filter[key as keyof ResourceFilter]) count += 1;
    }
    return count;
  });

  public getFilterCount(): Signal<number> {
    return this._filterCount;
  }

  public getFilter(): Signal<ResourceFilter | null> {
    return this._filter.asReadonly();
  }

  public setFilter(filter: ResourceFilter): void {
    this._filter.set(filter);
  }
}
