import { resetPassword } from "aws-amplify/auth";

export async function forgotPassword(email: string) {
  return resetPassword({ username: email });
}
