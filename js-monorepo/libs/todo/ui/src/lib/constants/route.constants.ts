export const TODO_ROUTES = {
  BASE: 'todo',
  GET_ALL: `todo`,
  GET_ONE: (id: number) => `todo/${id}`,
  CREATE_ONE: `todo`,
  UPDATE_ONE: (id: number) => `todo/${id}`,
  DELETE_ONE: (id: number) => `todo/${id}`,
  COMPLETE_ONE: (id: number) => `todo/${id}/complete`,
} as const;

export const TAG_ROUTES = {
  BASE: 'tag',
  GET_ALL: `tag`,
  GET_ONE: (id: number) => `tag/${id}`,
  CREATE_ONE: `tag`,
  UPDATE_ONE: (id: number) => `tag/${id}`,
  DELETE_ONE: (id: number) => `tag/${id}`,
} as const;
