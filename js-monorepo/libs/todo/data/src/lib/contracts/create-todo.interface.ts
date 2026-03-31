import { TodoItem } from '../types';

export interface CreateTodoDto {
  title: string;
  description?: string;
  completed: boolean;
  tagIds: number[];
}

export type CreateTodoResponse = TodoItem;
