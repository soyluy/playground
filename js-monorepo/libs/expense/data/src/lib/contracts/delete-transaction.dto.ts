import { Transaction } from '../interfaces';

export interface DeleteTransactionDto {
  id: number;
}

export type DeleteTransactionResponse = Transaction;
