import { fetchAuthSession } from "aws-amplify/auth";

export async function getIdToken(): Promise<string> {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();

  if (!token) {
    throw new Error("No ID token available");
  }

  return token;
}
