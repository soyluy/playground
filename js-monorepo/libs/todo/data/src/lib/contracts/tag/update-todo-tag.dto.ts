import { TodoTag } from '../../types';

export interface UpdateTodoTagDto {
  name: string | null;
  colorHex: string | null;
}

export type UpdateTodoTagResponse = TodoTag;
