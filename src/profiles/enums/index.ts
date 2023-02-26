export const ProfileService = {
  Kakao: 'kakao',
} as const;
export type ProfileService =
  (typeof ProfileService)[keyof typeof ProfileService];
