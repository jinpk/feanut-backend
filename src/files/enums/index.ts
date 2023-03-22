export const FilePurpose = {
  ProfileImage: 'profileimage',
} as const;
export type FilePurpose = (typeof FilePurpose)[keyof typeof FilePurpose];

export const SupportContentType = {
  PNG: 'image/png',
  JPG: 'image/jpg',
  JPEG: 'image/jpeg',
  HEIC: 'image/heic',
  HIFC: 'image/hifc',
} as const;
export type SupportContentType =
  (typeof SupportContentType)[keyof typeof SupportContentType];
