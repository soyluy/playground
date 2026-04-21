import { computed, inject, Injectable, Signal } from '@angular/core';
import { ServerExpensePersistenceStrategy } from './strategies/server-expense-persistence.strategy';
import { LocalExpensePersistenceStrategy } from './strategies/local-expense-persistence.strategy';
import { AuthService } from '@hub/auth-ui';
import { ExpensePersistenceStrategy } from './expense-persistence.strategy';

@Injectable({ providedIn: 'root' })
export class ExpenseStrategyService {
  private readonly _localStrategy = inject(LocalExpensePersistenceStrategy);
  private readonly _serverStrategy = inject(ServerExpensePersistenceStrategy);
  private readonly _user = inject(AuthService).user;

  readonly strategy: Signal<ExpensePersistenceStrategy> = computed(() =>
    this._user() ? this._serverStrategy : this._localStrategy,
  );
}
