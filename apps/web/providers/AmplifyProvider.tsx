"use client";

import { Amplify } from "aws-amplify";
import { cognitoConfig } from "../../../packages/auth-client/src";
import { ReactNode } from "react";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: cognitoConfig.userPoolId,
      userPoolClientId: cognitoConfig.webClientId,
    },
  },
});

console.log("🔥 Amplify configured");

export default function AmplifyProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
