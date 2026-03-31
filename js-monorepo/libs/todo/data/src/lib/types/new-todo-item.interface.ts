import { TodoTag } from './todo-tag.interface';

export interface NewTodoItem {
  title: string;
  description?: string;
  completed: boolean;
  tags?: TodoTag[];
}
