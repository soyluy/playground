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
  protected readonly buttonText = computed(() =>
    this._data.mode === 'create' ? 'Add Tag' : 'Update Tag',
  );

  protected model = signal<NewTodoTag>({
    name: this._data.tag?.name ?? '',
    colorHex: this.normalizeColorHex(this._data.tag?.colorHex),
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

  private normalizeColorHex(color?: string): string {
    const raw = color?.replace(/^#/, '').trim() ?? '';
    return /^[0-9a-fA-F]{6}$/.test(raw) ? `#${raw}` : '#000000';
  }
}
