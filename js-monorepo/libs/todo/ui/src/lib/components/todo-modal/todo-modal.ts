import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NewTodoItem, TodoItem, TodoTag } from '@hub/todo-data';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TodoTagService } from '../../services/todo-tag.service';
import { DIALOG_DATA, DialogRef } from '@hub/ui-infra';

export type TodoModalData = {
  options: TodoModalOptions;
};

export type TodoModalOptions = {
  mode: 'edit' | 'create';
  editing: TodoItem | null;
};

type FormOutputType = Omit<NewTodoItem, 'tags'> & {
  tags: number[];
};

@Component({
  selector: 'todo-modal',
  templateUrl: './todo-modal.html',
  styleUrls: ['./todo-modal.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
})
export class TodoModal {
  private readonly _data = inject(DIALOG_DATA) as TodoModalData;
  private readonly _dialogRef = inject(DialogRef<TodoModal>);
  private readonly _options = this._data.options;
  private readonly _tagService = inject(TodoTagService);

  protected readonly mode = this._options.mode;
  protected readonly title =
    this._options.mode === 'create' ? 'Create Todo' : 'Edit Todo';
  protected readonly editing = this._options.editing;

  protected readonly tags = this._tagService.getTags();

  private readonly fields = {
    title: new FormControl<string>(
      this.editing?.title ?? '',
      Validators.required,
    ),
    description: new FormControl<string>(this.editing?.description ?? ''),
    completed: new FormControl<boolean>(this.editing?.completed ?? false),
    dueDate: new FormControl<Date | null>(this.editing?.dueDate ?? null),
    tags: new FormControl<number[]>(this.editing?.tags?.map((t) => t.id) ?? []),
    research: new FormControl<boolean>(false),
  };

  protected readonly fg: FormGroup = new FormGroup(this.fields);

  protected submitForm() {
    const values = this.fg.value as FormOutputType;
    console.log('values', values);
    const output: NewTodoItem = {
      title: values.title,
      description: values.description,
      dueDate: values.dueDate,
      completed: values.completed,
      tags: values.tags.map((tagId) =>
        this.getTagFromId(tagId as unknown as number),
      ),
      research: values.research,
    };
    this._dialogRef.close(output);
  }

  protected onCancel(): void {
    this._dialogRef.close();
  }

  protected get dueDateInputValue(): string {
    const dueDate = this.fields.dueDate.value;
    if (!dueDate) {
      return '';
    }
    return this.formatDateForInput(dueDate);
  }

  protected onDueDateChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    this.fields.dueDate.setValue(value ? new Date(value) : null);
  }

  private getTagFromId(id: number): TodoTag {
    const tag = this.tags().find((t) => t.id === id) as TodoTag;
    if (!tag) {
      throw new Error(`Tag with id ${id} not found`);
    }
    return tag;
  }

  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
