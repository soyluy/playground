import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  Signal,
  ViewChild,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { NewTodoItem, TodoItem, TodoTag } from '@hub/todo-data';
import { TodoService } from '../../services/todo.service';
import { MatDialog } from '@angular/material/dialog';
import { TodoModal, TodoModalOptions } from '../todo-modal/todo-modal';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  MatListItem,
  MatListItemIcon,
  MatListItemLine,
  MatListItemMeta,
  MatListItemTitle,
} from '@angular/material/list';
import { TagPillComponent } from '../tag-pill/tag-pill';
import { DueDateIndicatorComponent } from '../due-date-indicator/due-date-indicator';

@Component({
  selector: 'todo-item',
  standalone: true,
  imports: [
    MatListItem,
    MatListItemIcon,
    MatListItemTitle,
    MatListItemLine,
    MatListItemMeta,
    MatButtonModule,
    MatCheckboxModule,
    TagPillComponent,
    DueDateIndicatorComponent,
  ],
  templateUrl: './todo-item.html',
  styleUrls: ['./todo-item.scss'],
})
export class TodoItemComponent implements AfterViewInit, OnDestroy {
  readonly todo = input.required<TodoItem>();
  private readonly _crudService = inject(TodoService);
  private readonly dialog = inject(MatDialog);
  private resizeObserver: ResizeObserver | null = null;
  protected isDescriptionExpanded = false;
  protected readonly isDescriptionTruncated = signal(false);
  @ViewChild('descriptionTextRef')
  private descriptionTextRef?: ElementRef<HTMLElement>;

  protected readonly tags: Signal<TodoTag[]> = computed(
    () => this.todo().tags ?? [],
  );
  protected readonly hasDescription: Signal<boolean> = computed(() =>
    Boolean(this.todo().description?.trim()),
  );
  protected readonly descriptionText: Signal<string> = computed(
    () => this.todo().description?.trim() ?? '\u00A0',
  );

  constructor() {
    effect(() => {
      this.descriptionText();
      this.scheduleTruncationMeasurement();
    });
  }

  ngAfterViewInit(): void {
    this.observeDescriptionResize();
    this.scheduleTruncationMeasurement();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
  }

  protected onEdit(): void {
    const options: TodoModalOptions = {
      mode: 'edit',
      editing: this.todo(),
    };
    const dialogRef = this.dialog.open(TodoModal, {
      data: { options },
      panelClass: 'todo-modal',
    });

    dialogRef.afterClosed().subscribe((result: NewTodoItem | undefined) => {
      if (result) {
        this._crudService.updateTodo({
          ...this.todo(),
          ...result,
        });
      }
    });
  }

  protected onDelete(): void {
    this._crudService.deleteTodo(this.todo().id);
  }

  protected onToggleCompleted(): void {
    this._crudService.updateTodo({
      ...this.todo(),
      completed: !this.todo().completed,
    });
  }

  protected onDescriptionToggle(): void {
    if (!this.hasDescription()) {
      return;
    }
    this.isDescriptionExpanded = !this.isDescriptionExpanded;
    this.scheduleTruncationMeasurement();
  }

  private observeDescriptionResize(): void {
    const descriptionElement = this.descriptionTextRef?.nativeElement;
    if (!descriptionElement || typeof ResizeObserver === 'undefined') {
      return;
    }

    this.resizeObserver = new ResizeObserver(() => {
      this.measureDescriptionTruncation();
    });
    this.resizeObserver.observe(descriptionElement);
  }

  private scheduleTruncationMeasurement(): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.requestAnimationFrame(() => {
      this.measureDescriptionTruncation();
    });
  }

  private measureDescriptionTruncation(): void {
    const descriptionElement = this.descriptionTextRef?.nativeElement;
    if (!descriptionElement || !this.hasDescription() || this.isDescriptionExpanded) {
      this.isDescriptionTruncated.set(false);
      return;
    }

    const isTruncated = descriptionElement.scrollWidth > descriptionElement.clientWidth;
    this.isDescriptionTruncated.set(isTruncated);
  }
}
