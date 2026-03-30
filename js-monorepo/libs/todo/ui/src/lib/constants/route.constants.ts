export const TODO_ROUTES = {
  BASE: 'todo',
  GET_ALL: `todo`,
  GET_ONE: (id: number) => `todo/${id}`,
  CREATE_ONE: `todo`,
  UPDATE_ONE: (id: number) => `todo/${id}`,
  DELETE_ONE: (id: number) => `todo/${id}`,
} as const;
