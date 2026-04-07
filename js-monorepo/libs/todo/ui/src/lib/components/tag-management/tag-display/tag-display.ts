import { Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { NewTodoTag, TodoTag, UpdateTodoTagDto } from '@hub/todo-data';
import { TodoTagService } from '../../../services/todo-tag.service';
import { TodoTagModal } from '../tag-modal/tag-modal';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'todo-tag-display',
  standalone: true,
  templateUrl: './tag-display.html',
  styleUrls: ['./tag-display.scss'],
  imports: [MatButtonModule],
})
export class TagDisplay {
  private readonly _todoTagService = inject(TodoTagService);
  private readonly _dialog = inject(MatDialog);
  readonly tag = input.required<TodoTag>();

  protected swatchColor(): string {
    const raw = this.tag().colorHex?.replace(/^#/, '').trim() ?? '';
    return /^[0-9a-fA-F]{6}$/.test(raw) ? `#${raw}` : '#9e9e9e';
  }

  protected onDeleteTag(): void {
    this._todoTagService.deleteTag(this.tag().id);
  }

  protected onUpdateTag(): void {
    const dialogRef = this._dialog.open(TodoTagModal, {
      data: {
        mode: 'update',
        tag: this.tag(),
      },
    });
    dialogRef
      .afterClosed()
      .subscribe((result: UpdateTodoTagDto | undefined) => {
        if (result) {
          this._todoTagService.updateTag(this.tag().id, result);
        }
      });
  }
}
