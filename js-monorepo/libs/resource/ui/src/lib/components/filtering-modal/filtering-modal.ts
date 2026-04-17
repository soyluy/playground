import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import {
  RESOURCE_STATUSES,
  RESOURCE_TYPES,
  ResourceFilter,
  ResourceStatus,
  ResourceType,
} from '../../constants/ui.constants';

@Component({
  selector: 'resource-filtering-modal',
  templateUrl: './filtering-modal.html',
  styleUrls: ['./filtering-modal.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
  ],
})
export class FilteringModal {
  private readonly _dialogRef = inject(MatDialogRef<FilteringModal>);
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
