export const UseType = {
  Open: 5,
  Refresh: 5,
  Addpoll: 5,
} as const;
export type UseType = (typeof UseType)[keyof typeof UseType]; //
