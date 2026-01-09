import "@aws-amplify/react-native";
import { Amplify } from "aws-amplify";
import { PropsWithChildren } from "react";
import { cognitoConfig } from "@av/aws";

let configured = false;

export function AmplifyProvider({ children }: PropsWithChildren) {
  if (!configured) {
    Amplify.configure({
      Auth: {
        Cognito: {
          userPoolId: cognitoConfig.userPoolId,
          userPoolClientId: cognitoConfig.webClientId,
        },
      },
    });

    configured = true;
    console.log("AMPLIFY CONFIGURED (NATIVE)");
  }

  return <>{children}</>;
}
