import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { form, FormField, required } from '@angular/forms/signals';
import { NewTodoTag, TodoTag } from '@hub/todo-data';

export type TodoTagModalOptions = {
  mode: 'create' | 'update';
  tag?: TodoTag;
};

@Component({
  selector: 'todo-tag-modal',
  standalone: true,
  templateUrl: './tag-modal.html',
  styleUrls: ['./tag-modal.scss'],
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormField,
  ],
})
export class TodoTagModal {
  private readonly _dialogRef = inject(MatDialogRef<TodoTagModal>);
  private readonly _data = inject<TodoTagModalOptions>(MAT_DIALOG_DATA);

  protected readonly title = computed(() =>
    this._data.mode === 'create'
      ? 'Add Tag'
      : `Edit Tag: ${this._data.tag?.name}`,
  );

  protected model = signal<NewTodoTag>({
    name: this._data.tag?.name ?? '',
    colorHex: this._data.tag?.colorHex ?? '#000000',
  });

  protected tagForm = form(this.model, (path) => {
    required(path.name);
    required(path.colorHex);
  });

  protected submitForm() {
    const values = this.model();
    values.colorHex = values.colorHex.replace('#', '');
    this._dialogRef.close(values);
  }

  protected onCancel() {
    this._dialogRef.close();
  }
}
