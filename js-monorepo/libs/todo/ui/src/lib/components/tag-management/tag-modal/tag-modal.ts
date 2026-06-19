import { Component, computed, inject, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { NewTodoTag, TodoTag } from '@hub/todo-data';
import { DIALOG_DATA, DialogRef } from '@hub/ui-infra';

export type TodoTagModalOptions = {
  mode: 'create' | 'update';
  tag?: TodoTag;
};

@Component({
  selector: 'todo-tag-modal',
  templateUrl: './tag-modal.html',
  styleUrls: ['./tag-modal.scss'],
  imports: [FormField],
})
export class TodoTagModal {
  private readonly _dialogRef = inject(DialogRef<TodoTagModal>);
  private readonly _data = inject(DIALOG_DATA) as TodoTagModalOptions;

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
