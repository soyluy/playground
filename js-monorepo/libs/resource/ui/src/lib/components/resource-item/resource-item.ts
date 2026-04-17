import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import {
  MatListItem,
  MatListItemLine,
  MatListItemMeta,
  MatListItemTitle,
} from '@angular/material/list';
import { NewResourceItem, ResourceItem } from '@hub/resource-data';
import {
  RESOURCE_STATUS_LABELS,
  RESOURCE_TYPE_LABELS,
} from '../../constants/ui.constants';
import { ResourceService } from '../../services/resource.service';
import {
  ResourceModal,
  ResourceModalOptions,
} from '../resource-modal/resource-modal';

@Component({
  selector: 'resource-item',
  imports: [
    MatListItem,
    MatListItemTitle,
    MatListItemLine,
    MatListItemMeta,
    MatButtonModule,
  ],
  templateUrl: './resource-item.html',
  styleUrls: ['./resource-item.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceItemComponent {
  readonly resource = input.required<ResourceItem>();

  private readonly _resourceService = inject(ResourceService);
  private readonly _dialog = inject(MatDialog);

  protected readonly typeLabel = computed(
    () => RESOURCE_TYPE_LABELS[this.resource().type],
  );
  protected readonly statusLabel = computed(
    () => RESOURCE_STATUS_LABELS[this.resource().status],
  );
  protected readonly hasDescription = computed(() =>
    Boolean(this.resource().description?.trim()),
  );
  protected readonly hasUrl = computed(() => Boolean(this.resource().url?.trim()));

  protected onEdit(): void {
    const options: ResourceModalOptions = {
      mode: 'edit',
      editing: this.resource(),
    };
    const dialogRef = this._dialog.open(ResourceModal, {
      data: { options },
      panelClass: 'resource-modal',
    });

    dialogRef.afterClosed().subscribe((result: NewResourceItem | undefined) => {
      if (result) {
        this._resourceService.updateResource({
          ...this.resource(),
          ...result,
        });
      }
    });
  }

  protected onDelete(): void {
    this._resourceService.deleteResource(this.resource().id);
  }
}
