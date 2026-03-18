import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'todo-todo',
  imports: [],
  templateUrl: './todo.html',
  styleUrl: './todo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Todo {}
