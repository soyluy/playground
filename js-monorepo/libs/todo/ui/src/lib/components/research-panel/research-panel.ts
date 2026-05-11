import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import {
  RESEARCH_STEP_LABELS,
  ResearchState,
  ResearchStep,
  ResearchStreamService,
} from '../../services/research-stream.service';

const STEP_ORDER: ResearchStep[] = [
  'subtopics',
  'web_search',
  'source_analysis',
  'verification',
  'synthesis',
];

@Component({
  selector: 'todo-research-panel',
  templateUrl: './research-panel.html',
  styleUrls: ['./research-panel.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatDividerModule,
  ],
})
export class ResearchPanelComponent {
  private readonly _researchService = inject(ResearchStreamService);

  protected readonly stepLabels = RESEARCH_STEP_LABELS;
  protected readonly stepOrder = STEP_ORDER;

  protected readonly state: Signal<ResearchState | undefined> = computed(() => {
    const id = this._researchService.selectedId();
    if (!id) return undefined;
    return this._researchService.states().get(id);
  });

  protected readonly progressValue: Signal<number> = computed(() => {
    const s = this.state();
    if (!s || s.status === 'done') return 100;
    if (!s.currentStep) return 0;
    const idx = STEP_ORDER.indexOf(s.currentStep);
    return Math.round(((idx + 1) / STEP_ORDER.length) * 100);
  });

  protected isStepDone(step: ResearchStep): boolean {
    const s = this.state();
    if (!s) return false;
    if (s.status === 'done') return true;
    if (!s.currentStep) return false;
    return STEP_ORDER.indexOf(s.currentStep) > STEP_ORDER.indexOf(step);
  }

  protected onClose(): void {
    this._researchService.closePanel();
  }
}
