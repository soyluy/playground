import { Component, input } from '@angular/core';
import { TodoTag } from '@hub/todo-data';

@Component({
  selector: 'todo-tag-pill',
  templateUrl: './tag-pill.html',
  styleUrls: ['./tag-pill.scss'],
  imports: [],
})
export class TagPillComponent {
  readonly tag = input.required<TodoTag>();

  /** 6-digit hex with `#` for CSS `background-color` (`colorHex` omits `#`). */
  protected get backgroundColor(): string {
    const raw = this.tag().colorHex?.replace(/^#/, '').trim() ?? '';
    return /^[0-9a-fA-F]{6}$/.test(raw) ? `#${raw}` : '#9e9e9e';
  }

  protected get name(): string {
    return this.tag().name;
  }

  protected get textColor(): string {
    const raw = this.tag().colorHex?.replace(/^#/, '').trim() ?? '';
    if (!/^[0-9a-fA-F]{6}$/.test(raw)) {
      return '#000';
    }
    const r = parseInt(raw.slice(0, 2), 16);
    const g = parseInt(raw.slice(2, 4), 16);
    const b = parseInt(raw.slice(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000' : '#fff';
  }
}
