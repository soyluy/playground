import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TodoService } from './services/todo.service';

@Component({
  selector: 'todo-list',
  imports: [],
  templateUrl: './todo.html',
  styleUrls: ['./todo.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TodoService],
})
export class TodoList {
  private readonly _crudService = inject(TodoService);
  protected todos = this._crudService.getTodos();

  onAddTodoClick(): void {
    this._crudService.addTodo({
      id: this.generateTodoId(),
      title: 'New Todo',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  private generateTodoId(): string {
    return Date.now().toString();
  }
}
