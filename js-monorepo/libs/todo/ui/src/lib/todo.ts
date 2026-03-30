import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TodoService } from './services/todo.service';
import {
  TodoModal,
  TodoModalOptions,
} from './components/todo-modal/todo-modal';
import { MatDialog } from '@angular/material/dialog';
import { NewTodoItem, TodoItem } from '@hub/todo-data';
import { TodoPersistenceService } from './services/todo-persistence.service';
import { TodoItemComponent } from './components/todo-item/todo-item';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatList } from '@angular/material/list';
import { TodoApiService } from './services/todo-api.service';

@Component({
  selector: 'todo-list',
  imports: [
    TodoItemComponent,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatList,
  ],
  templateUrl: './todo.html',
  styleUrls: ['./todo.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TodoService, TodoPersistenceService, TodoApiService],
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
          id: Date.now(),
          createdAt: new Date(),
          updatedAt: new Date(),
          ...result,
        };
        this._crudService.addTodo(newTodo);
      }
    });
  }
}
