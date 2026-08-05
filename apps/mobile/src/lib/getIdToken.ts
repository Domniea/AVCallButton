import { fetchAuthSession } from "aws-amplify/auth";

export async function getIdToken(): Promise<string | null> {
  let session = await fetchAuthSession();
  let token = session.tokens?.idToken?.toString();
  if (token) return token;

  session = await fetchAuthSession({ forceRefresh: true });
  token = session.tokens?.idToken?.toString();
  return token ?? null;
}
