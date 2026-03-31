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

  protected get textColor(): string {
    const color = this.color;
    const r = parseInt(color.slice(0, 2), 16);
    const g = parseInt(color.slice(2, 4), 16);
    const b = parseInt(color.slice(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000' : '#fff';
  }
}
