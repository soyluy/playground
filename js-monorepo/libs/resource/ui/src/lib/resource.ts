import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatList } from '@angular/material/list';
import { ResourceItemComponent } from './components/resource-item/resource-item';
import {
  NewResourceItem,
  ResourceFilter,
} from './constants/ui.constants';
import {
  ResourceModal,
  ResourceModalOptions,
} from './components/resource-modal/resource-modal';
import { FilteringModal } from './components/filtering-modal/filtering-modal';
import { ResourceFilterService } from './services/resource-filter.service';
import { ResourceService } from './services/resource.service';

@Component({
  selector: 'resource-list',
  imports: [
    ResourceItemComponent,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatList,
  ],
  templateUrl: './resource.html',
  styleUrls: ['./resource.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceComponent {
  private readonly _dialog = inject(MatDialog);
  private readonly _resourceService = inject(ResourceService);
  private readonly _filterService = inject(ResourceFilterService);

  protected readonly resources = this._resourceService.getResources();
  protected readonly total = this._resourceService.getTotal();
  protected readonly offset = this._resourceService.getOffset();
  protected readonly limit = this._resourceService.getLimit();
  protected readonly filterCount = this._filterService.getFilterCount();

  protected readonly hasPreviousPage = computed(() => this.offset() > 0);
  protected readonly hasNextPage = computed(
    () => this.offset() + this.limit() < this.total(),
  );
  protected readonly pageLabel = computed(() => {
    if (this.total() === 0) {
      return '0-0 of 0';
    }

    const start = this.offset() + 1;
    const end = Math.min(this.offset() + this.limit(), this.total());
    return `${start}-${end} of ${this.total()}`;
  });
  protected readonly filterButtonLabel = computed(() => {
    const count = this.filterCount();
    return count > 0 ? `Set Filters (${count})` : 'Set Filters';
  });

  onAddResourceClick(): void {
    this.openResourceModal();
  }

  onSetFiltersClick(): void {
    this.openFiltersModal();
  }

  onPreviousPageClick(): void {
    this._resourceService.previousPage();
  }

  onNextPageClick(): void {
    this._resourceService.nextPage();
  }

  private openFiltersModal(): void {
    const dialogRef = this._dialog.open(FilteringModal, {
      panelClass: 'resource-modal',
    });

    dialogRef.afterClosed().subscribe((result: ResourceFilter | undefined) => {
      if (result) {
        this._filterService.setFilter(result);
        this._resourceService.resetPagination();
      }
    });
  }

  private openResourceModal(): void {
    const options: ResourceModalOptions = {
      mode: 'create',
      editing: null,
    };
    const dialogRef = this._dialog.open(ResourceModal, {
      data: { options },
      panelClass: 'resource-modal',
    });

    dialogRef.afterClosed().subscribe((result: NewResourceItem | undefined) => {
      if (result) {
        this._resourceService.addResource(result);
      }
    });
  }
}
