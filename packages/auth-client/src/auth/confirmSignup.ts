import { confirmSignUp } from "aws-amplify/auth";

export async function confirmSignup(email: string, code: string) {
  return confirmSignUp({
    username: email,
    confirmationCode: code,
  });
}
