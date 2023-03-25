export const QueryBoolean = {
  true: '1',
  false: '0',
  none: '',
} as const;
export type QueryBoolean = (typeof QueryBoolean)[keyof typeof QueryBoolean]; //
