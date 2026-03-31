export interface CreateTodoTagDto {
  name: string;
  colorHex: string;
}

export interface CreateTodoTagResponse extends CreateTodoTagDto {
  id: number;
}
