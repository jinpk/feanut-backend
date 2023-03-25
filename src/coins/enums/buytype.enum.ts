export const BuyType = {
  First: 5,
  Second: 10,
  Third: 30,
  Fourth: 50,
  Fifth: 100,
} as const;
export type BuyType = (typeof BuyType)[keyof typeof BuyType]; //
