export const Gender = {
  Male: 'male',
  Female: 'female',
} as const;
export type Gender = (typeof Gender)[keyof typeof Gender]; //
