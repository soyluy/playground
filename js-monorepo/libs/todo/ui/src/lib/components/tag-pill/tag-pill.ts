import { Component, input } from '@angular/core';
import { TodoTag } from '@hub/todo-data';

@Component({
  selector: 'todo-tag-pill',
  standalone: true,
  templateUrl: './tag-pill.html',
  styleUrls: ['./tag-pill.scss'],
  imports: [],
})
export class TagPillComponent {
  readonly tag = input.required<TodoTag>();

  protected get color(): string {
    return this.tag().colorHex;
  }

  protected get name(): string {
    return this.tag().name;
  }
}
