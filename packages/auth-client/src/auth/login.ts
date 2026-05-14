import { signIn } from "aws-amplify/auth";

export async function login(email: string, password: string): Promise<void> {
  await signIn({
    username: email,
    password,
    options: {
      authFlowType: "USER_PASSWORD_AUTH",
    },
  });
}
