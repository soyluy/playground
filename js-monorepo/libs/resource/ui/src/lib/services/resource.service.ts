import {
  computed,
  inject,
  Injectable,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  GetResourcesResponse,
  NewResourceItem,
  ResourceFilter,
  ResourceItem,
  UpdateResourceInput,
} from '@hub/resource-data';
import { debounceTime, map, switchMap, tap } from 'rxjs';
import {
  DEFAULT_RESOURCE_LIMIT,
  DEFAULT_RESOURCE_OFFSET,
} from '../constants/ui.constants';
import { ResourceApolloService } from './resource-apollo.service';
import { ResourceFilterService } from './resource-filter.service';

@Injectable({ providedIn: 'root' })
export class ResourceService {
  private readonly _persistenceService = inject(ResourceApolloService);
  private readonly _filterService = inject(ResourceFilterService);
  private readonly _activeFilter: Signal<ResourceFilter | null> =
    this._filterService.getFilter();

  private readonly _refresh = signal(0);

  private readonly _resources: Signal<ResourceItem[]>;
  private readonly _total: WritableSignal<number> = signal(0);
  private readonly _offset: WritableSignal<number> = signal(DEFAULT_RESOURCE_OFFSET);
  private readonly _limit: WritableSignal<number> = signal(DEFAULT_RESOURCE_LIMIT);

  constructor() {
    const resourcesResponse$ = toObservable(
      computed(() => ({
        filter: this._activeFilter(),
        offset: this._offset(),
        limit: this._limit(),
        _refresh: this._refresh(),
      })),
    ).pipe(
      debounceTime(300),
      switchMap(({ filter, offset, limit }) =>
        this._persistenceService.getResources({
          ...(filter ?? {}),
          offset,
          limit,
        }),
      ),
      tap((res: GetResourcesResponse) => {
        this._total.set(res.total);
        this._offset.set(res.offset);
        this._limit.set(res.limit);
      }),
      map((res: GetResourcesResponse) => res.data),
    );

    this._resources = toSignal(resourcesResponse$, { initialValue: [] });
  }

  public getResources(): Signal<ResourceItem[]> {
    return this._resources;
  }

  public getTotal(): Signal<number> {
    return this._total.asReadonly();
  }

  public getOffset(): Signal<number> {
    return this._offset.asReadonly();
  }

  public getLimit(): Signal<number> {
    return this._limit.asReadonly();
  }

  public addResource(resource: NewResourceItem): void {
    const res$ = this._persistenceService.createResource(resource);
    res$.subscribe({
      next: () => {
        this._refreshResources();
      },
      error: (error) => {
        console.error('error creating resource', error);
      },
    });
  }

  public updateResource(resource: ResourceItem): void {
    const input: UpdateResourceInput = {
      title: resource.title,
      url: resource.url ?? undefined,
      description: resource.description ?? undefined,
      category: resource.category,
      type: resource.type,
      status: resource.status,
      metadata: resource.metadata,
    };

    const res$ = this._persistenceService.updateResource(resource.id, input);
    res$.subscribe({
      next: () => {
        this._refreshResources();
      },
      error: (error) => {
        console.error('error updating resource', error);
      },
    });
  }

  public deleteResource(id: string): void {
    const res$ = this._persistenceService.deleteResource(id);
    res$.subscribe({
      next: () => {
        this._refreshResources();
      },
      error: (error) => {
        console.error('error deleting resource', error);
      },
    });
  }

  public getResource(id: string): ResourceItem | undefined {
    return this._resources().find((resource) => resource.id === id);
  }

  public nextPage(): void {
    const nextOffset = this._offset() + this._limit();
    if (nextOffset >= this._total()) {
      return;
    }

    this._offset.set(nextOffset);
  }

  public previousPage(): void {
    const prevOffset = Math.max(this._offset() - this._limit(), 0);
    if (prevOffset === this._offset()) {
      return;
    }

    this._offset.set(prevOffset);
  }

  public resetPagination(): void {
    this._offset.set(DEFAULT_RESOURCE_OFFSET);
  }

  private _refreshResources(): void {
    this._refresh.update((refresh) => refresh + 1);
  }
}
