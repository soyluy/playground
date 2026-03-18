import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TodoItem } from '../../types/todo-item.interface';

export type TodoModalOptions = {
  mode: 'edit' | 'create';
  editing?: TodoItem;
};

@Component({
  selector: 'todo-modal',
  standalone: true,
  templateUrl: './todo-modal.html',
  styleUrls: ['./todo-modal.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoModal {}
