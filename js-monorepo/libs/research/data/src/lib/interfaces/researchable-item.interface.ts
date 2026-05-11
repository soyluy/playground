export interface ResearchableItem {
  id: string;
  topic: string;
  tags: string[];
  notes: string;
  instructions: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  dueDate: Date | null;
}

export interface CreateResearchableItem {
  todoId: string;
  topic: string;
  tags: string[];
  notes: string;
  instructions: string;
  dueDate: Date | null;
}
