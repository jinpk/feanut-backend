export const UseType = {
    Discover: 'discover',
    Refresh: 'refresh',
    Addpoll: 'addpoll',
  } as const;
  export type UseType = (typeof UseType)[keyof typeof UseType]; //
  