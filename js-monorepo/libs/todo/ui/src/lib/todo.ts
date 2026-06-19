import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TodoService } from './services/todo.service';
import {
  TodoModal,
  TodoModalOptions,
} from './components/todo-modal/todo-modal';
import { NewTodoItem } from '@hub/todo-data';
import { TodoItemComponent } from './components/todo-item/todo-item';
import { TodoFilter } from '@hub/todo-data';
import { FilteringModal } from './components/filtering-modal/filtering-modal';
import { TodoFilterService } from './services/todo-filter.service';
import { ResearchStreamService } from './services/research-stream.service';
import { ResearchPanelComponent } from './components/research-panel/research-panel';
import { DialogService } from '@hub/ui-infra';

@Component({
  selector: 'todo-list',
  imports: [TodoItemComponent, ResearchPanelComponent],
  templateUrl: './todo.html',
  styleUrls: ['./todo.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoList {
  private readonly _dialogService = inject(DialogService);
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
    const dialogRef = this._dialogService.open(FilteringModal);

    dialogRef.afterClosed().subscribe((result) => {
      const filter = result as TodoFilter | undefined;
      if (filter) {
        this._filterService.setFilter(filter);
      }
    });
  }
  private openTodoModal(): void {
    const options: TodoModalOptions = {
      mode: 'create',
      editing: null,
    };
    const dialogRef = this._dialogService.open(TodoModal, { options });

    dialogRef.afterClosed().subscribe((result) => {
      const newTodo = result as NewTodoItem | undefined;
      if (newTodo) {
        this._crudService.addTodo(newTodo);
      }
    });
  }
}
