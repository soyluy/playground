import { PaginationDto } from '../../common/pagination.dto';
import { TodoFilter } from '../../filters/todo/todo.filter';
import { TodoItem } from '../../types';

export type GetTodoQueryParamsDto = PaginationDto & TodoFilter;

export type GetTodosResponse = {
  data: TodoItem[];
  total: number;
  page: number;
  pageSize: number;
};
