import { Route } from '@angular/router';
import { TagManagement, TodoList } from '@hub/todo-ui';
import { ExpenseTracker } from '@hub/expense-ui';
import { ResourceComponent } from '@hub/resource-ui';

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
  {
    path: 'resource',
    component: ResourceComponent,
  },
];
