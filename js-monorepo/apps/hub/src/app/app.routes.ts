import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'tag-management',
    loadComponent: () => import('@hub/todo-ui').then((m) => m.TagManagement),
  },
  {
    path: 'todo',
    loadComponent: () => import('@hub/todo-ui').then((m) => m.TodoList),
  },
  {
    path: 'expense-tracker',
    loadComponent: () =>
      import('@hub/expense-ui').then((m) => m.ExpenseTracker),
  },
  {
    path: 'resource',
    loadComponent: () =>
      import('@hub/resource-ui').then((m) => m.ResourceComponent),
  },
  {
    path: 'calendar',
    loadComponent: () => import('@hub/event-ui').then((m) => m.EventCalendar),
  },
];
