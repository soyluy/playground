import { InjectionToken } from '@angular/core';

export type ExpensePersistenceMode = 'local' | 'server';

export const EXPENSE_PERSISTENCE_MODE = new InjectionToken<ExpensePersistenceMode>(
  'EXPENSE_PERSISTENCE_MODE',
  {
    providedIn: 'root',
    factory: () => 'local',
  },
);
