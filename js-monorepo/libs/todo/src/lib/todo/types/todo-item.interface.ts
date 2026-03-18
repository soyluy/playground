export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
