import { PaginationDto } from '../../common/pagination.dto';
import { TodoFilter } from '../../filters/todo/todo.filter';

export type GetTodoQueryParamsDto = PaginationDto & TodoFilter;
