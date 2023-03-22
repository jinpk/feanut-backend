export const AuthPurpose = {
  SignUp: 'signup',
  ResetPassword: 'reset-password',
} as const;
export type AuthPurpose = (typeof AuthPurpose)[keyof typeof AuthPurpose];
