import { fetchAuthSession } from "aws-amplify/auth";
import { logout } from "./logout";

export async function normalizeAuthState() {
  try {
    const session = await fetchAuthSession();

    if (session.tokens) {
      await logout();
    }
  } catch {
  }
}
