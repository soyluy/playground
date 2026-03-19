import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TodoService } from './services/todo.service';
import {
  TodoModal,
  TodoModalOptions,
} from './components/todo-modal/todo-modal';
import { MatDialog } from '@angular/material/dialog';
import { NewTodoItem, TodoItem } from './types/todo-item.interface';
import { TodoPersistenceService } from './services/todo-persistence.service';

@Component({
  selector: 'todo-list',
  imports: [],
  templateUrl: './todo.html',
  styleUrls: ['./todo.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TodoService, TodoPersistenceService],
})
export class TodoList {
  private readonly _dialog = inject(MatDialog);
  private readonly _crudService = inject(TodoService);
  protected todos = this._crudService.getTodos();

  onAddTodoClick(): void {
    const options: TodoModalOptions = {
      mode: 'create',
    };
    const dialogRef = this._dialog.open(TodoModal, {
      data: { options },
      panelClass: 'todo-modal',
    });

    dialogRef.afterClosed().subscribe((result: NewTodoItem | undefined) => {
      if (result) {
        const newTodo: TodoItem = {
          id: this.generateTodoId(),
          createdAt: new Date(),
          updatedAt: new Date(),
          ...result,
        };
        this._crudService.addTodo(newTodo);
      }
    });
  }

  private generateTodoId(): string {
    return Date.now().toString();
  }
}
