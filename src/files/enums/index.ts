export const FileType = {
  ProfileImage: 'profile-image',
} as const;
export type FileType = (typeof FileType)[keyof typeof FileType];
