import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TodoService } from './services/todo.service';
import {
  TodoModal,
  TodoModalOptions,
} from './components/todo-modal/todo-modal';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'todo-list',
  imports: [],
  templateUrl: './todo.html',
  styleUrls: ['./todo.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TodoService],
})
export class TodoList {
  private readonly _dialog = inject(MatDialog);
  private readonly _crudService = inject(TodoService);
  protected todos = this._crudService.getTodos();

  onAddTodoClick(): void {
    // this._crudService.addTodo({
    //   id: this.generateTodoId(),
    //   title: 'New Todo',
    //   completed: false,
    //   createdAt: new Date(),
    //   updatedAt: new Date(),
    // });

    const options: TodoModalOptions = {
      mode: 'create',
    };
    this._dialog.open(TodoModal, {
      data: { options },
      panelClass: 'todo-modal',
    });
  }

  // private generateTodoId(): string {
  //   return Date.now().toString();
  // }
}
