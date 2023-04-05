export const AuthPurpose = {
  SignUp: 'signup',
  SignIn: 'signin',
} as const;
export type AuthPurpose = (typeof AuthPurpose)[keyof typeof AuthPurpose];
