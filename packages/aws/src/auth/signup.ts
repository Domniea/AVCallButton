import { signUp } from "aws-amplify/auth";

export async function signup(email: string, password: string) {
  const result = await signUp({
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
