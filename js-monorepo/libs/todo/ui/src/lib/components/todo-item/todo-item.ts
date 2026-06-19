import {
  AfterViewInit,
  ChangeDetectionStrategy,
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
import {
  RESEARCH_STEP_LABELS,
  ResearchState,
  ResearchStreamService,
} from '../../services/research-stream.service';
import { DialogService } from '@hub/ui-infra';
import { TodoModal, TodoModalOptions } from '../todo-modal/todo-modal';
import { TagPillComponent } from '../tag-pill/tag-pill';
import { DueDateIndicatorComponent } from '../due-date-indicator/due-date-indicator';

@Component({
  selector: 'todo-item',
  imports: [TagPillComponent, DueDateIndicatorComponent],
  templateUrl: './todo-item.html',
  styleUrls: ['./todo-item.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoItemComponent implements AfterViewInit, OnDestroy {
  readonly todo = input.required<TodoItem>();
  private readonly _crudService = inject(TodoService);
  private readonly _researchService = inject(ResearchStreamService);
  private readonly _dialogService = inject(DialogService);

  protected readonly researchState: Signal<ResearchState | undefined> =
    computed(() => {
      const id = this.todo().researchId;
      if (!id) return undefined;
      return this._researchService.states().get(id);
    });

  protected readonly researchStepLabel: Signal<string> = computed(() => {
    const step = this.researchState()?.currentStep;
    return step ? RESEARCH_STEP_LABELS[step] : 'Researching…';
  });

  protected readonly stepLabels = RESEARCH_STEP_LABELS;
  private resizeObserver: ResizeObserver | null = null;
  protected readonly isDescriptionExpanded = signal(false);
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
    const dialogRef = this._dialogService.open(TodoModal, { options });

    dialogRef.afterClosed().subscribe((result) => {
      const newTodo = result as NewTodoItem | undefined;
      if (newTodo) {
        this._crudService.updateTodo(this.todo().id, {
          title: newTodo.title,
          dueDate: newTodo.dueDate,
          description: newTodo.description,
          completed: newTodo.completed,
          tagIds: newTodo.tags?.map((t) => t.id) ?? null,
        });
      }
    });
  }

  protected onDelete(): void {
    this._crudService.deleteTodo(this.todo().id);
  }

  protected onToggleCompleted(): void {
    this._crudService.updateTodo(this.todo().id, {
      title: this.todo().title,
      dueDate: this.todo().dueDate,
      description: this.todo().description,
      completed: !this.todo().completed,
      tagIds: this.todo().tags?.map((t) => t.id) ?? null,
    });
  }

  protected onViewResearch(): void {
    const id = this.todo().researchId;
    if (id) {
      this._researchService.openPanel(id);
    }
  }

  protected onDescriptionToggle(): void {
    if (!this.hasDescription()) {
      return;
    }
    this.isDescriptionExpanded.set(!this.isDescriptionExpanded());
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
    if (
      !descriptionElement ||
      !this.hasDescription() ||
      this.isDescriptionExpanded()
    ) {
      this.isDescriptionTruncated.set(false);
      return;
    }

    const isTruncated =
      descriptionElement.scrollWidth > descriptionElement.clientWidth;
    this.isDescriptionTruncated.set(isTruncated);
  }
}
