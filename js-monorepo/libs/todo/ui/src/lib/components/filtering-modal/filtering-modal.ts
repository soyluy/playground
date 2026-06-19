import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TodoFilter } from '@hub/todo-data';
import { TodoTagService } from '../../services/todo-tag.service';
import { TodoTag } from '@hub/todo-data';
import { DialogRef } from '@hub/ui-infra';

@Component({
  selector: 'todo-filtering-modal',
  templateUrl: './filtering-modal.html',
  styleUrls: ['./filtering-modal.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
})
export class FilteringModal {
  private readonly _dialogRef = inject(DialogRef<FilteringModal>);
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

  protected onCancelClick(): void {
    this._dialogRef.close();
  }

  protected get dueDateBeforeInputValue(): string {
    return this.toInputDate(this.form.controls.dueDateBefore.value);
  }

  protected get dueDateAfterInputValue(): string {
    return this.toInputDate(this.form.controls.dueDateAfter.value);
  }

  protected onDueDateBeforeChange(event: Event): void {
    this.form.controls.dueDateBefore.setValue(this.fromInputDate(event));
  }

  protected onDueDateAfterChange(event: Event): void {
    this.form.controls.dueDateAfter.setValue(this.fromInputDate(event));
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

  private toInputDate(value: Date | null): string {
    if (!value) {
      return '';
    }
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private fromInputDate(event: Event): Date | null {
    const target = event.target as HTMLInputElement;
    return target.value ? new Date(target.value) : null;
  }
}
