import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ENVIRONMENT } from '@hub/ui-infra';
import { ResearchEvent, ResearchResult } from '@hub/research-data';

export type ResearchStatus = 'connecting' | 'running' | 'done' | 'error';
export type ResearchStep =
  | 'subtopics'
  | 'web_search'
  | 'source_analysis'
  | 'verification'
  | 'synthesis';

export interface ResearchState {
  status: ResearchStatus;
  currentStep: ResearchStep | null;
  result: ResearchResult | null;
  error: string | null;
}

export const RESEARCH_STEP_LABELS: Record<ResearchStep, string> = {
  subtopics: 'Identifying subtopics',
  web_search: 'Searching the web',
  source_analysis: 'Analysing sources',
  verification: 'Verifying findings',
  synthesis: 'Synthesising report',
};

@Injectable({ providedIn: 'root' })
export class ResearchStreamService {
  private readonly _apiUrl = inject(ENVIRONMENT).apiUrl;
  private readonly _http = inject(HttpClient);

  private readonly _states = signal(new Map<string, ResearchState>());
  private readonly _activeSources = new Map<string, EventSource>();
  private readonly _selectedId = signal<string | null>(null);

  readonly states: Signal<ReadonlyMap<string, ResearchState>> =
    this._states.asReadonly();
  readonly selectedId: Signal<string | null> = this._selectedId.asReadonly();

  getState(researchId: string): Signal<ResearchState | undefined> {
    return computed(() => this._states().get(researchId));
  }

  openPanel(researchId: string): void {
    this._selectedId.set(researchId);
  }

  closePanel(): void {
    this._selectedId.set(null);
  }

  connect(researchId: string): void {
    if (this._activeSources.has(researchId)) return;
    const existing = this._states().get(researchId);
    if (existing?.status === 'done' || existing?.status === 'error') return;

    this._patchState(researchId, {
      status: 'connecting',
      currentStep: null,
      result: null,
      error: null,
    });

    const url = `${this._apiUrl}/research/${researchId}/stream`;
    const source = new EventSource(url, { withCredentials: true });
    this._activeSources.set(researchId, source);

    source.onmessage = (e: MessageEvent) => {
      const event = JSON.parse(e.data) as ResearchEvent;
      this._handleEvent(researchId, event);
    };

    source.onerror = () => {
      this._closeSource(researchId);
      this._fetchFallback(researchId);
    };
  }

  private _handleEvent(researchId: string, event: ResearchEvent): void {
    switch (event.type) {
      case 'start':
        this._patchState(researchId, { status: 'running' });
        break;
      case 'progress':
        if (event.status === 'running') {
          this._patchState(researchId, {
            status: 'running',
            currentStep: event.step as ResearchStep,
          });
        }
        break;
      case 'result':
        this._patchState(researchId, { result: event.data });
        break;
      case 'complete':
        this._patchState(researchId, { status: 'done', currentStep: null });
        this._closeSource(researchId);
        break;
      case 'error':
        this._patchState(researchId, { status: 'error', error: event.error });
        this._closeSource(researchId);
        break;
    }
  }

  private _fetchFallback(researchId: string): void {
    this._http
      .get<{ status: string; result: ResearchResult | null }>(
        `${this._apiUrl}/research/${researchId}`,
      )
      .subscribe({
        next: (doc) => {
          if (doc.status === 'done') {
            this._patchState(researchId, {
              status: 'done',
              result: doc.result,
              currentStep: null,
              error: null,
            });
          } else if (doc.status === 'error') {
            this._patchState(researchId, {
              status: 'error',
              error: 'Research pipeline failed',
            });
          }
        },
        error: () => {
          this._patchState(researchId, {
            status: 'error',
            error: 'Could not connect to research stream',
          });
        },
      });
  }

  private _patchState(
    researchId: string,
    patch: Partial<ResearchState>,
  ): void {
    this._states.update((map) => {
      const next = new Map(map);
      const current: ResearchState = next.get(researchId) ?? {
        status: 'connecting',
        currentStep: null,
        result: null,
        error: null,
      };
      next.set(researchId, { ...current, ...patch });
      return next;
    });
  }

  private _closeSource(researchId: string): void {
    this._activeSources.get(researchId)?.close();
    this._activeSources.delete(researchId);
  }
}
