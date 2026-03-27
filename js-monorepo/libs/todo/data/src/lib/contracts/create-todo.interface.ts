import { TodoItem } from '../types';

export interface CreateTodoDto {
  title: string;
  description?: string;
  completed: boolean;
}

export type CreateTodoResponse = TodoItem;
