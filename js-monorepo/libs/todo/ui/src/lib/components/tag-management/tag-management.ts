import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { NewTodoTag } from '@hub/todo-data';
import { TodoTagService } from '../../services/todo-tag.service';
import { TagDisplay } from './tag-display/tag-display';
import { TodoTagModal } from './tag-modal/tag-modal';

@Component({
  selector: 'todo-tag-management',
  standalone: true,
  templateUrl: './tag-management.html',
  styleUrls: ['./tag-management.scss'],
  imports: [MatButtonModule, TagDisplay],
})
export class TagManagement {
  private readonly _todoTagService = inject(TodoTagService);
  private readonly _dialog = inject(MatDialog);

  protected readonly tags = this._todoTagService.getTags();

  protected onAddTag(): void {
    const dialogRef = this._dialog.open(TodoTagModal, {
      data: {
        mode: 'create',
      },
    });
    dialogRef.afterClosed().subscribe((result: NewTodoTag | undefined) => {
      if (result) {
        this._todoTagService.addTag(result);
      }
    });
  }
}
