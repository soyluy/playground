import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TodoService } from './services/todo.service';
import {
  TodoModal,
  TodoModalOptions,
} from './components/todo-modal/todo-modal';
import { MatDialog } from '@angular/material/dialog';
import { NewTodoItem } from '@hub/todo-data';
import { TodoPersistenceService } from './services/todo-persistence.service';
import { TodoItemComponent } from './components/todo-item/todo-item';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatList } from '@angular/material/list';
import { TodoApiService } from './services/todo-api.service';
import { FilteringUi } from './components/filtering-ui/filtering-ui';
import { TodoFilter } from '@hub/todo-data';

@Component({
  selector: 'todo-list',
  imports: [
    TodoItemComponent,
    FilteringUi,
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
  protected activeFilter = this._crudService.getFilter();

  onAddTodoClick(): void {
    const options: TodoModalOptions = {
      mode: 'create',
      editing: null,
    };
    const dialogRef = this._dialog.open(TodoModal, {
      data: { options },
      panelClass: 'todo-modal',
    });

    dialogRef.afterClosed().subscribe((result: NewTodoItem | undefined) => {
      if (result) {
        this._crudService.addTodo(result);
      }
    });
  }

  onFilterApply(filter: TodoFilter): void {
    this._crudService.setFilter(filter);
  }

  onFilterClear(): void {
    this._crudService.setFilter({});
  }
}
