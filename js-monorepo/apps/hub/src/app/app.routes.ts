import { Route } from '@angular/router';
import { TagManagement, TodoList } from '@hub/todo-ui';

export const appRoutes: Route[] = [
  {
    path: 'tag-management',
    component: TagManagement,
  },
  {
    path: 'todo',
    component: TodoList,
  },
  {
    path: 'expense-tracker',
    component: ExpenseTracker,
  },
];
