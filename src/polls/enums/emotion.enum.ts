export const Emotion = {
  happiness: 'happiness',
  gratitude: 'gratitude',
  serenity: 'serenity',
  interest: 'interest',
  hope: 'hope',
  pride: 'pride',
  amusement: 'amusement',
  inspiration: 'inspiration',
  awe: 'awe',
  love: 'love',
} as const;
export type Emotion = (typeof Emotion)[keyof typeof Emotion]; //
