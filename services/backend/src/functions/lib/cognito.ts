import {
  AdminGetUserCommand,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";

const cognito = new CognitoIdentityProviderClient({
  region: process.env.COGNITO_REGION ?? "us-east-1",
});

export async function cognitoUserExists(email: string): Promise<boolean> {
  try {
    await cognito.send(
      new AdminGetUserCommand({
        UserPoolId: process.env.COGNITO_USER_POOL_ID!,
        Username: email,
      }),
    );
    return true;
  } catch (err) {
    if (
      err instanceof Error &&
      (err.name === "UserNotFoundException" ||
        err.message.includes("UserNotFoundException"))
    ) {
      return false;
    }
    throw err;
  }
}
