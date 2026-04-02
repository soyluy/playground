import { TodoItem } from '../../types';

export interface CreateTodoDto {
  title: string;
  description: string | null;
  completed: boolean;
  tagIds: number[];
  dueDate: Date | null;
}

export type CreateTodoResponse = TodoItem;
