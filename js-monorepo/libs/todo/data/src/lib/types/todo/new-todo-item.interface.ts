import { TodoTag } from '../tag/todo-tag.interface';

export interface NewTodoItem {
  title: string;
  description: string | null;
  completed: boolean;
  tags: TodoTag[] | null;
}
