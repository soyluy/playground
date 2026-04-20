import { inject, Injectable, signal } from '@angular/core';
import {
  EXPENSE_PERSISTENCE_MODE,
  ExpensePersistenceMode,
} from './expense-persistence.types';

@Injectable({ providedIn: 'root' })
export class ExpensePersistenceConfigService {
  private readonly _initialMode = inject(EXPENSE_PERSISTENCE_MODE);
  private readonly _mode = signal<ExpensePersistenceMode>(this._initialMode);

  readonly mode = this._mode.asReadonly();

  getMode(): ExpensePersistenceMode {
    return this._mode();
  }

  setMode(mode: ExpensePersistenceMode): void {
    this._mode.set(mode);
  }
}
