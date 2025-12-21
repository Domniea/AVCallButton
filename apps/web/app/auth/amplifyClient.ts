"use client";

import { Amplify } from "aws-amplify";
import { cognitoConfig } from "@av/aws";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: cognitoConfig.userPoolId,
      userPoolClientId: cognitoConfig.webClientId,
      loginWith: {
        oauth: {
          domain: cognitoConfig.domain,
          scopes: cognitoConfig.scopes,
          redirectSignIn: ["https://localhost:3000/auth/callback"],
          redirectSignOut: ["https://localhost:3000/"],
          responseType: "code",
        },
      },
    },
  },
});

console.log("✅ Amplify configured (web)");
