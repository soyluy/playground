import { TodoTag } from '../../types';

export interface UpdateTodoTagDto extends Partial<TodoTag> {
  name?: string;
  colorHex?: string;
}

export type UpdateTodoTagResponse = TodoTag;
