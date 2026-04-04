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
import { TodoFilter } from '@hub/todo-data';
import { FilteringModal } from './components/filtering-modal/filtering-modal';
import { TodoFilterService } from './services/todo-filter.service';

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
  private readonly _filterService = inject(TodoFilterService);

  protected todos = this._crudService.getTodos();

  onAddTodoClick(): void {
    this.openTodoModal();
  }

  onSetFiltersClick(): void {
    this.openFiltersModal();
  }

  private openFiltersModal(): void {
    const dialogRef = this._dialog.open(FilteringModal, {
      panelClass: 'todo-modal',
    });

    dialogRef.afterClosed().subscribe((result: TodoFilter | undefined) => {
      if (result) {
        this._filterService.setFilter(result);
      }
    });
  }
  private openTodoModal(): void {
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
}
