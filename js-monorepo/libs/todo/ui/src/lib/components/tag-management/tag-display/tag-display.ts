import { Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { TodoTag } from '@hub/todo-data';

@Component({
  selector: 'todo-tag-display',
  standalone: true,
  templateUrl: './tag-display.html',
  styleUrls: ['./tag-display.scss'],
  imports: [MatButtonModule],
})
export class TagDisplay {
  readonly tag = input.required<TodoTag>();

  protected onDeleteTag(): void {
    console.log('delete tag');
  }

  protected onUpdateTag(): void {
    console.log('update tag');
  }
}
