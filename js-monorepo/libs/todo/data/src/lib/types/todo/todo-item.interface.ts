import { TodoTag } from '../tag/todo-tag.interface';

export interface TodoItem {
  id: number;
  title: string;
  completed: boolean;
  description: string | null;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  tags: TodoTag[] | null;
  researchId: string | null;
}
