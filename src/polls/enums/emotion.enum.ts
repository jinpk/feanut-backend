export const Emotion = {
  Joy: 'joy',
  Gratitude: 'gratitude',
  Serenity: 'serenity',
  Interest: 'interest',
  Hope: 'hope',
  Pride: 'pride',
  Amusement: 'amusement',
  Inspiration: 'inspiration',
  Awe: 'awe',
  Love: 'love',
} as const;
export type Emotion = (typeof Emotion)[keyof typeof Emotion]; //
