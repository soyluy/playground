import { Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { TodoTag, UpdateTodoTagDto } from '@hub/todo-data';
import { DialogService } from '@hub/ui-infra';
import { TodoTagService } from '../../../services/todo-tag.service';
import { TodoTagModal } from '../tag-modal/tag-modal';

@Component({
  selector: 'todo-tag-display',
  templateUrl: './tag-display.html',
  styleUrls: ['./tag-display.scss'],
  imports: [MatButtonModule],
})
export class TagDisplay {
  private readonly _todoTagService = inject(TodoTagService);
  private readonly _dialogService = inject(DialogService);
  readonly tag = input.required<TodoTag>();

  protected swatchColor(): string {
    const raw = this.tag().colorHex?.replace(/^#/, '').trim() ?? '';
    return /^[0-9a-fA-F]{6}$/.test(raw) ? `#${raw}` : '#9e9e9e';
  }

  protected onDeleteTag(): void {
    this._todoTagService.deleteTag(this.tag().id);
  }

  protected onUpdateTag(): void {
    const dialogRef = this._dialogService.open(TodoTagModal, {
      mode: 'update',
      tag: this.tag(),
    });
    dialogRef
      .afterClosed()
      .subscribe((result) => {
        const updatedTag = result as UpdateTodoTagDto | undefined;
        if (updatedTag) {
          this._todoTagService.updateTag(this.tag().id, updatedTag);
        }
      });
  }
}
