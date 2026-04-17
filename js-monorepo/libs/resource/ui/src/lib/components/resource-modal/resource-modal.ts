import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  NewResourceItem,
  RESOURCE_STATUSES,
  RESOURCE_TYPES,
  ResourceItem,
  ResourceStatus,
  ResourceType,
} from '@hub/resource-data';

export type ResourceModalData = {
  options: ResourceModalOptions;
};

export type ResourceModalOptions = {
  mode: 'edit' | 'create';
  editing: ResourceItem | null;
};

type FormOutputType = {
  title: string;
  url: string | null;
  description: string | null;
  category: string;
  type: ResourceType;
  status: ResourceStatus;
};

@Component({
  selector: 'resource-modal',
  templateUrl: './resource-modal.html',
  styleUrls: ['./resource-modal.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
  ],
})
export class ResourceModal {
  private readonly _data = inject<ResourceModalData>(MAT_DIALOG_DATA);
  private readonly _dialogRef = inject(MatDialogRef<ResourceModal>);
  private readonly _options = this._data.options;

  protected readonly mode = this._options.mode;
  protected readonly title =
    this._options.mode === 'create' ? 'Create Resource' : 'Edit Resource';
  protected readonly editing = this._options.editing;
  protected readonly resourceTypes = RESOURCE_TYPES;
  protected readonly resourceStatuses = RESOURCE_STATUSES;

  private readonly fields = {
    title: new FormControl<string>(
      this.editing?.title ?? '',
      Validators.required,
    ),
    url: new FormControl<string | null>(this.editing?.url ?? null),
    description: new FormControl<string | null>(this.editing?.description ?? null),
    category: new FormControl<string>(
      this.editing?.category ?? '',
      Validators.required,
    ),
    type: new FormControl<ResourceType>(
      this.editing?.type ?? RESOURCE_TYPES[0],
      Validators.required,
    ),
    status: new FormControl<ResourceStatus>(
      this.editing?.status ?? RESOURCE_STATUSES[0],
      Validators.required,
    ),
  };

  protected readonly fg: FormGroup = new FormGroup(this.fields);

  protected submitForm(): void {
    const values = this.fg.value as FormOutputType;
    const output: NewResourceItem = {
      title: values.title.trim(),
      url: values.url?.trim() || undefined,
      description: values.description?.trim() || undefined,
      category: values.category.trim(),
      type: values.type,
      status: values.status,
      metadata: this.editing?.metadata ?? {},
    };
    this._dialogRef.close(output);
  }

  protected onCancel(): void {
    this._dialogRef.close();
  }
}
