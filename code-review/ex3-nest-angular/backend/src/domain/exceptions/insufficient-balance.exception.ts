import { DomainException } from './domain.exception';

export class InsufficientBalanceException extends DomainException {
  constructor(requiredAmount: number, availableAmount: number) {
    super('Insufficient account balance', 'INSUFFICIENT_BALANCE', {
      requiredAmount,
      availableAmount,
    });
  }
}
