import { Component, inject } from '@angular/core';
import { TodoTagService } from '../../services/todo-tag.service';
import { TagDisplay } from './tag-display/tag-display';

@Component({
  selector: 'todo-tag-management',
  standalone: true,
  templateUrl: './tag-management.html',
  styleUrls: ['./tag-management.scss'],
  imports: [TagDisplay],
  providers: [TodoTagService],
})
export class TagManagement {
  private readonly _todoTagService = inject(TodoTagService);

  protected readonly tags = this._todoTagService.getTags();

  protected onAddTag(): void {
    console.log('add tag');
  }
}
