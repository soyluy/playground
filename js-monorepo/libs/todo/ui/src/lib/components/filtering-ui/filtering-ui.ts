import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  inject,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TodoFilter, TodoTag } from '@hub/todo-data';
import { TodoTagService } from '../../services/todo-tag.service';

type CompletedFilterValue = 'all' | 'true' | 'false';
type SortByFilterValue = '' | 'title' | 'dueDate' | 'createdAt' | 'updatedAt';
type SortOrderFilterValue = 'asc' | 'desc';

type FilteringFormValue = {
  search: string;
  tags: number[];
  allIncludeTags: number[];
  allExcludeTags: number[];
  completed: CompletedFilterValue;
  sortBy: SortByFilterValue;
  sortOrder: SortOrderFilterValue;
  dueDateBefore: string;
  dueDateAfter: string;
};

@Component({
  selector: 'todo-filtering-ui',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  providers: [TodoTagService],
  templateUrl: './filtering-ui.html',
  styleUrls: ['./filtering-ui.scss'],
})
export class FilteringUi implements OnChanges {
  private readonly _todoTagService = inject(TodoTagService);
  @Input() filter: TodoFilter | null = null;
  @Output() filterApply = new EventEmitter<TodoFilter>();
  @Output() filterClear = new EventEmitter<void>();
  protected readonly tags = this._todoTagService.getTags();

  protected readonly form = new FormGroup({
    search: new FormControl<string>(''),
    tags: new FormControl<number[]>([], { nonNullable: true }),
    allIncludeTags: new FormControl<number[]>([], { nonNullable: true }),
    allExcludeTags: new FormControl<number[]>([], { nonNullable: true }),
    completed: new FormControl<CompletedFilterValue>('all', { nonNullable: true }),
    sortBy: new FormControl<SortByFilterValue>('', { nonNullable: true }),
    sortOrder: new FormControl<SortOrderFilterValue>('asc', { nonNullable: true }),
    dueDateBefore: new FormControl<string>(''),
    dueDateAfter: new FormControl<string>(''),
  });

  protected isOpen = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filter']) {
      this.form.patchValue(this.toFormValue(this.filter ?? {}), {
        emitEvent: false,
      });
    }
  }

  protected togglePanel(): void {
    this.isOpen = !this.isOpen;
  }

  protected closePanel(): void {
    this.isOpen = false;
  }

  protected onApply(): void {
    const formValue = this.form.getRawValue();
    const nextFilter: TodoFilter = {
      search: this.emptyToUndefined(formValue.search),
      tags: formValue.tags.length > 0 ? formValue.tags : undefined,
      allIncludeTags:
        formValue.allIncludeTags.length > 0 ? formValue.allIncludeTags : undefined,
      allExcludeTags:
        formValue.allExcludeTags.length > 0 ? formValue.allExcludeTags : undefined,
      completed: this.parseCompleted(formValue.completed),
      sortBy: formValue.sortBy || undefined,
      sortOrder: formValue.sortBy ? formValue.sortOrder : undefined,
      dueDateBefore: this.parseDate(formValue.dueDateBefore),
      dueDateAfter: this.parseDate(formValue.dueDateAfter),
    };

    this.filterApply.emit(nextFilter);
    this.closePanel();
  }

  protected onClear(): void {
    this.form.reset(this.toFormValue({}));
    this.filterClear.emit();
    this.closePanel();
  }

  private toFormValue(filter: TodoFilter): FilteringFormValue {
    return {
      search: filter.search ?? '',
      tags: filter.tags ?? [],
      allIncludeTags: filter.allIncludeTags ?? [],
      allExcludeTags: filter.allExcludeTags ?? [],
      completed:
        filter.completed === undefined ? 'all' : filter.completed ? 'true' : 'false',
      sortBy: filter.sortBy ?? '',
      sortOrder: filter.sortOrder ?? 'asc',
      dueDateBefore: this.toDateInputValue(filter.dueDateBefore),
      dueDateAfter: this.toDateInputValue(filter.dueDateAfter),
    };
  }

  protected renderSelectedTagNames(ids: number[]): string {
    if (ids.length === 0) {
      return 'None selected';
    }
    return ids
      .map((id) => this.tags().find((tag) => tag.id === id)?.name ?? `#${id}`)
      .join(', ');
  }

  protected get filterCount(): number {
    return this.countActiveFilters(this.filter ?? {});
  }

  protected swatchColor(tag: TodoTag): string {
    const raw = tag.colorHex?.replace(/^#/, '').trim() ?? '';
    return /^[0-9a-fA-F]{6}$/.test(raw) ? `#${raw}` : '#9e9e9e';
  }

  private countActiveFilters(filter: TodoFilter): number {
    let count = 0;
    if (filter.search) count += 1;
    if (filter.tags?.length) count += 1;
    if (filter.allIncludeTags?.length) count += 1;
    if (filter.allExcludeTags?.length) count += 1;
    if (filter.completed !== undefined) count += 1;
    if (filter.sortBy) count += 1;
    if (filter.dueDateBefore) count += 1;
    if (filter.dueDateAfter) count += 1;
    return count;
  }

  private toDateInputValue(value: Date | string | undefined): string {
    if (!value) {
      return '';
    }
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    return date.toISOString().slice(0, 10);
  }

  private parseCompleted(value: CompletedFilterValue): boolean | undefined {
    if (value === 'all') {
      return undefined;
    }
    return value === 'true';
  }

  private parseDate(value: string | null): Date | undefined {
    if (!value) {
      return undefined;
    }
    const parsed = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) {
      return undefined;
    }
    return parsed;
  }

  private emptyToUndefined(value: string | null): string | undefined {
    const normalized = value?.trim();
    return normalized ? normalized : undefined;
  }
}
