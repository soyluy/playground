import { TodoTag } from '../tag/todo-tag.interface';

export interface TodoItem {
  id: number;
  title: string;
  completed: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: TodoTag[];
}
