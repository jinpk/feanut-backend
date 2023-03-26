export const OS = {
  Android: 'android',
  iOS: 'ios',
} as const;
export type OS = (typeof OS)[keyof typeof OS]; //
