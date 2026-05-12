export const EVENT_ROUTES = {
  BASE: 'event',
  GET_ALL: `event`,
  GET_ONE: (id: string) => `event/${id}`,
  CREATE_ONE: `event`,
  UPDATE_ONE: (id: string) => `event/${id}`,
  DELETE_ONE: (id: string) => `event/${id}`,
} as const;
