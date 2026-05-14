import { Injectable, computed, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap, tap } from 'rxjs';

import { Auction } from '../../../core/models/auction.model';
import { PaginationParams } from '../../../core/models/pagination.model';
import { AuctionApiService } from './auction-api.service';

type AuctionFilters = {
  q?: string;
  status?: string;
  type?: string;
  categorySlug?: string;
  sellerId?: string;
  minPrice?: number;
  maxPrice?: number;
};

@Injectable({ providedIn: 'root' })
export class AuctionStateService {
  private readonly _auctions = signal<Auction[]>([]);
  private readonly _total = signal<number>(0);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _activeFilters = signal<AuctionFilters>({});
  private readonly _pagination = signal<PaginationParams>({
    page: 1,
    limit: 20,
  });
  private readonly _refresh = signal<number>(0);

  readonly auctions = computed(() => this._auctions());
  readonly total = computed(() => this._total());
  readonly loading = computed(() => this._loading());
  readonly error = computed(() => this._error());
  readonly activeFilters = computed(() => this._activeFilters());
  readonly pagination = computed(() => this._pagination());

  readonly _sync = toSignal(
    toObservable(
      computed(() => ({
        refresh: this._refresh(),
        filters: this._activeFilters(),
        pagination: this._pagination(),
      })),
    ).pipe(
      tap(() => {
        this._loading.set(true);
        this._error.set(null);
      }),
      switchMap((state) =>
        this._auctionApiService
          .searchAuctions({
            ...state.filters,
            page: state.pagination.page ?? 1,
            limit: state.pagination.limit ?? 20,
          })
          .pipe(
            map((response) => ({
              data: response.data ?? [],
              total: response.total ?? 0,
            })),
            catchError((err) => {
              const message =
                err instanceof Error ? err.message : 'Failed to load auctions';
              this._error.set(message);
              return of({ data: [], total: 0 });
            }),
          ),
      ),
      tap((result) => {
        this._auctions.set(result.data);
        this._total.set(result.total);
        this._loading.set(false);
      }),
    ),
    { initialValue: { data: [], total: 0 } },
  );

  constructor(private readonly _auctionApiService: AuctionApiService) {}

  setFilters(filters: Partial<AuctionFilters>): void {
    this._activeFilters.update((current) => ({
      ...current,
      ...filters,
    }));
    this._pagination.set({ page: 1, limit: 20 });
    this.refresh();
  }

  nextPage(): void {
    const totalPages = Math.max(
      1,
      Math.ceil(this._total() / (this._pagination().limit ?? 20)),
    );
    this._pagination.update((current) => ({
      ...current,
      page: Math.min(totalPages, (current.page ?? 1) + 1),
    }));
    this.refresh();
  }

  prevPage(): void {
    this._pagination.update((current) => ({
      ...current,
      page: Math.max(1, (current.page ?? 1) - 1),
    }));
    this.refresh();
  }

  refresh(): void {
    this._refresh.update((value) => value + 1);
  }
}
