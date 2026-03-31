import { TodoItem } from '../../types';

export interface DeleteTodoDto {
  id: number;
}

export type DeleteTodoResponse = TodoItem;
