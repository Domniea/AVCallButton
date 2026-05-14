import { signUp, SignUpOutput } from "aws-amplify/auth";
import type { SignupResult } from "../types/auth";

export async function signup(
  email: string,
  password: string
): Promise<SignupResult> {
  const result: SignUpOutput = await signUp({
    username: email,
    password,
    options: {
      userAttributes: { email },
    },
  });

  return {
    userConfirmed: result.isSignUpComplete,
    nextStep: result.nextStep,
  };
}