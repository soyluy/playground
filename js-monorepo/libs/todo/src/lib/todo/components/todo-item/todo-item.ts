import { Component, inject, input } from '@angular/core';
import { NewTodoItem, TodoItem } from '../../types/todo-item.interface';
import { TodoService } from '../../services/todo.service';
import { MatDialog } from '@angular/material/dialog';
import { TodoModal, TodoModalOptions } from '../todo-modal/todo-modal';

@Component({
  selector: 'todo-item',
  standalone: true,
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
}
