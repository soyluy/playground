import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  RESOURCE_STATUSES,
  RESOURCE_TYPES,
  ResourceFilter,
  ResourceStatus,
  ResourceType,
} from '@hub/resource-data';
import { DialogRef } from '@hub/ui-infra';

@Component({
  selector: 'resource-filtering-modal',
  templateUrl: './filtering-modal.html',
  styleUrls: ['./filtering-modal.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
})
export class FilteringModal {
  private readonly _dialogRef = inject(DialogRef<FilteringModal>);
  protected readonly resourceTypes = RESOURCE_TYPES;
  protected readonly resourceStatuses = RESOURCE_STATUSES;

  protected readonly form = new FormGroup({
    type: new FormControl<ResourceType | null>(null),
    status: new FormControl<ResourceStatus | null>(null),
    category: new FormControl<string>(''),
  });

  protected onSubmitClick(): void {
    this.submit();
  }

  protected onCancelClick(): void {
    this._dialogRef.close();
  }

  private submit(): void {
    const v = this.form.value;

    const filter: ResourceFilter = {
      type: v.type ?? undefined,
      status: v.status ?? undefined,
      category: v.category?.trim() || undefined,
    };

    this._dialogRef.close(filter);
  }
}
