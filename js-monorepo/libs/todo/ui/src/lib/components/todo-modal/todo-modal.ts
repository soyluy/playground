import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NewTodoItem, TodoItem, TodoTag } from '@hub/todo-data';
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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TodoTagService } from '../../services/todo-tag.service';

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
  standalone: true,
  templateUrl: './todo-modal.html',
  styleUrls: ['./todo-modal.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatSelectModule,
  ],
  providers: [TodoTagService],
})
export class TodoModal {
  private readonly _data = inject<TodoModalData>(MAT_DIALOG_DATA);
  private readonly _dialogRef = inject(MatDialogRef<TodoModal>);
  private readonly _options = this._data.options;
  private readonly _tagService = inject(TodoTagService);

  protected readonly mode = this._options.mode;
  protected readonly title =
    this._options.mode === 'create' ? 'Create Todo' : 'Edit Todo';
  protected readonly editing = this._options.editing;

  protected readonly tags = this._tagService.getTags();

  private readonly fields = {
    title: new FormControl<string>('', Validators.required),
    description: new FormControl<string>(''),
    completed: new FormControl<boolean>(false),
    tags: new FormControl<TodoTag[]>([]),
  };

  protected readonly fg: FormGroup = new FormGroup(this.fields);

  protected submitForm() {
    const values = this.fg.value as FormOutputType;
    const output: NewTodoItem = {
      title: values.title,
      description: values.description,
      completed: values.completed,
      tags: values.tags.map((tagId) =>
        this.getTagFromId(tagId as unknown as number),
      ),
    };
    this._dialogRef.close(output);
  }

  protected onCancel(): void {
    this._dialogRef.close();
  }

  private getTagFromId(id: number): TodoTag {
    const tag = this.tags().find((t) => t.id === id) as TodoTag;
    if (!tag) {
      throw new Error(`Tag with id ${id} not found`);
    }
    return tag;
  }
}
