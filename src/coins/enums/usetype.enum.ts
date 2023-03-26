export const UseType = {
    Open: 'open',
  } as const;
  export type UseType = (typeof UseType)[keyof typeof UseType]; //
  