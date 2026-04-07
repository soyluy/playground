import { TodoItem } from '../../types';

export interface UpdateTodoDto {
  title: string | null;
  dueDate: Date | null;
  description: string | null;
  completed: boolean | null;
  tagIds: number[] | null;
}

export type UpdateTodoResponse = TodoItem;
