import { TodoItem } from '../../types';

export interface UpdateTodoDto {
  title: string | null;
  dueDate: Date | null;
  description: string | null;
  completed: boolean | null;
  tagIds: number[] | null;
  research: boolean;
}

export type UpdateTodoResponse = TodoItem;
