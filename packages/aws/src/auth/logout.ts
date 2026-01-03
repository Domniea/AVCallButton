import { signOut } from "aws-amplify/auth";

export async function logout() {
  await signOut();
}
