import { TodoItem } from '../types';

export interface UpdateTodoDto {
  id: number;
  title?: string;
  description?: string;
  completed?: boolean;
}

export type UpdateTodoResponse = TodoItem;
