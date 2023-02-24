export const Gender = {
  Male: 'male',
  Female: 'feamle',
} as const;
export type Gender = (typeof Gender)[keyof typeof Gender]; //
