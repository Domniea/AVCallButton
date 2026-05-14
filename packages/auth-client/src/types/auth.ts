export interface SignupResult {
  userConfirmed: boolean;
  nextStep?: {
    signUpStep: string;
    additionalInfo?: unknown;
  };
}
