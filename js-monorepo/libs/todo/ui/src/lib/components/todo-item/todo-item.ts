import { Component, inject, input } from '@angular/core';
import { NewTodoItem, TodoItem } from '@hub/todo-data';
import { TodoService } from '../../services/todo.service';
import { MatDialog } from '@angular/material/dialog';
import { TodoModal, TodoModalOptions } from '../todo-modal/todo-modal';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  MatListItem,
  MatListItemIcon,
  MatListItemLine,
  MatListItemMeta,
  MatListItemTitle,
} from '@angular/material/list';

@Component({
  selector: 'todo-item',
  standalone: true,
  imports: [
    MatListItem,
    MatListItemIcon,
    MatListItemTitle,
    MatListItemLine,
    MatListItemMeta,
    MatButtonModule,
    MatCheckboxModule,
  ],
  templateUrl: './todo-item.html',
  styleUrls: ['./todo-item.scss'],
})
export class TodoItemComponent {
  readonly todo = input.required<TodoItem>();
  private readonly _crudService = inject(TodoService);
  private readonly dialog = inject(MatDialog);

  protected onEdit(): void {
    const options: TodoModalOptions = {
      mode: 'edit',
      editing: this.todo(),
    };
    const dialogRef = this.dialog.open(TodoModal, {
      data: { options },
      panelClass: 'todo-modal',
    });

    dialogRef.afterClosed().subscribe((result: NewTodoItem | undefined) => {
      if (result) {
        this._crudService.updateTodo({
          ...this.todo(),
          ...result,
          updatedAt: new Date(),
        });
      }
    });
  }

  protected onDelete(): void {
    this._crudService.deleteTodo(this.todo().id);
  }

  protected onToggleCompleted(): void {
    this._crudService.updateTodo({
      ...this.todo(),
      completed: !this.todo().completed,
      updatedAt: new Date(),
    });
  }
}
