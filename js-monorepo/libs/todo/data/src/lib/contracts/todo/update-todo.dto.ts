import { TodoItem } from '../../types';

export interface UpdateTodoDto {
  id: number;
  title: string | null;
  description: string | null;
  completed: boolean | null;
  tagIds: number[] | null;
}

export type UpdateTodoResponse = TodoItem;
