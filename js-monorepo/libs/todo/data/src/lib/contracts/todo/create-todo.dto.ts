import { TodoItem } from '../../types';

export interface CreateTodoDto {
  title: string;
  description: string | null;
  completed: boolean;
  tagIds: number[];
  dueDate: Date | null;
  research: boolean;
}

export type CreateTodoResponse = TodoItem;
