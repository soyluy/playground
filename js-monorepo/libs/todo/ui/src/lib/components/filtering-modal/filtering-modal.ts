import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TodoFilter } from '@hub/todo-data';
import { TodoTagService } from '../../services/todo-tag.service';
import { TodoTag } from '@hub/todo-data';

@Component({
  selector: 'todo-filtering-modal',
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
    MatDatepickerModule,
    MatNativeDateModule,
  ],
})
export class FilteringModal {
  private readonly _dialogRef = inject(MatDialogRef<FilteringModal>);
  private readonly _tagService = inject(TodoTagService);
  protected readonly tags: Signal<TodoTag[]> = this._tagService.getTags();

  protected readonly form = new FormGroup({
    search: new FormControl<string>(''),
    tags: new FormControl<number[] | null>(null),
    allIncludeTags: new FormControl<number[] | null>(null),
    allExcludeTags: new FormControl<number[] | null>(null),
    completed: new FormControl<boolean | null>(null),
    sortBy: new FormControl<
      'title' | 'dueDate' | 'createdAt' | 'updatedAt' | null
    >(null),
    sortOrder: new FormControl<'asc' | 'desc' | null>(null),
    dueDateBefore: new FormControl<Date | null>(null),
    dueDateAfter: new FormControl<Date | null>(null),
  });

  protected onSubmitClick() {
    this.submit();
  }

  private submit() {
    const v = this.form.value;

    const filter: TodoFilter = {
      search: v.search || undefined,
      tags: v.tags ?? undefined,
      allIncludeTags: v.allIncludeTags ?? undefined,
      allExcludeTags: v.allExcludeTags ?? undefined,
      completed: v.completed ?? undefined,
      sortBy: v.sortBy ?? undefined,
      sortOrder: v.sortOrder ?? undefined,
      dueDateBefore: v.dueDateBefore ?? undefined,
      dueDateAfter: v.dueDateAfter ?? undefined,
    };

    this._dialogRef.close(filter);
  }
}
