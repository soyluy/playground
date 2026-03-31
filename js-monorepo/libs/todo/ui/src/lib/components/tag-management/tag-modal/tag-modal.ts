import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { form, FormField, required } from '@angular/forms/signals';
import { NewTodoTag } from '@hub/todo-data';

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

  protected model = signal<NewTodoTag>({
    name: '',
    colorHex: '#000000',
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
