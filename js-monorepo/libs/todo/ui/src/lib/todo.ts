import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TodoService } from './services/todo.service';
import {
  TodoModal,
  TodoModalOptions,
} from './components/todo-modal/todo-modal';
import { MatDialog } from '@angular/material/dialog';
import { NewTodoItem } from '@hub/todo-data';
import { TodoItemComponent } from './components/todo-item/todo-item';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatList } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { TodoFilter } from '@hub/todo-data';
import { FilteringModal } from './components/filtering-modal/filtering-modal';
import { TodoFilterService } from './services/todo-filter.service';
import { ResearchStreamService } from './services/research-stream.service';
import { ResearchPanelComponent } from './components/research-panel/research-panel';

@Component({
  selector: 'todo-list',
  imports: [
    TodoItemComponent,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatList,
    MatSidenavModule,
    ResearchPanelComponent,
  ],
  templateUrl: './todo.html',
  styleUrls: ['./todo.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoList {
  private readonly _dialog = inject(MatDialog);
  private readonly _crudService = inject(TodoService);
  private readonly _filterService = inject(TodoFilterService);
  protected readonly _researchService = inject(ResearchStreamService);

  protected todos = this._crudService.getTodos();
  protected readonly researchPanelOpen = this._researchService.selectedId;

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
