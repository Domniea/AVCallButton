import { signIn } from "aws-amplify/auth";

export async function login(email: string, password: string) {
  console.log("➡️ signing in (forced USER_PASSWORD_AUTH)");

  const result = await signIn({
    username: email,
    password,
    options: {
      authFlowType: "USER_PASSWORD_AUTH",
    },
  });

  console.log("🧠 signIn raw result:", result);
  return result;
}
