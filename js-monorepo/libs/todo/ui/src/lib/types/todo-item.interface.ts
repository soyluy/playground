export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewTodoItem {
  title: string;
  description?: string;
  completed: boolean;
}
