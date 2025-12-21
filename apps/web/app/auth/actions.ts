import { signInWithRedirect, signOut } from "aws-amplify/auth";

export function login() {
  return signInWithRedirect();
}

export function logout() {
  return signOut();
}
