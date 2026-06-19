import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { NewTodoTag } from '@hub/todo-data';
import { DialogService } from '@hub/ui-infra';
import { TodoTagService } from '../../services/todo-tag.service';
import { TagDisplay } from './tag-display/tag-display';
import { TodoTagModal } from './tag-modal/tag-modal';

@Component({
  selector: 'todo-tag-management',
  templateUrl: './tag-management.html',
  styleUrls: ['./tag-management.scss'],
  imports: [MatButtonModule, TagDisplay],
})
export class TagManagement {
  private readonly _todoTagService = inject(TodoTagService);
  private readonly _dialogService = inject(DialogService);

  protected readonly tags = this._todoTagService.getTags();

  protected onAddTag(): void {
    const dialogRef = this._dialogService.open(TodoTagModal, {
      mode: 'create',
    });
    dialogRef.afterClosed().subscribe((result) => {
      const newTag = result as NewTodoTag | undefined;
      if (newTag) {
        this._todoTagService.addTag(newTag);
      }
    });
  }
}
