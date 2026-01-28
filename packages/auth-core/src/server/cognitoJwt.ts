import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { createRemoteJWKSet, jwtVerify } from "jose";
import type { AuthIdentity } from "../user";

type CognitoJwtEnv = {
  region: string;
  userPoolId: string;
  clientId: string;
};

/**
 * Extract Bearer token safely from API Gateway v2 event
 */
function getBearerToken(event: APIGatewayProxyEventV2): string | null {
  const headers = event.headers ?? {};
  const auth =
    headers.authorization ?? headers.Authorization ?? headers.AUTHORIZATION;

  if (!auth) return null;

  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function getJwks(env: CognitoJwtEnv) {
  const issuer = `https://cognito-idp.${env.region}.amazonaws.com/${env.userPoolId}`;

  if (!jwksCache.has(issuer)) {
    jwksCache.set(
      issuer,
      createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`)),
    );
  }

  return jwksCache.get(issuer)!;
}

export async function requireAuthIdentity(
  event: APIGatewayProxyEventV2,
  env: CognitoJwtEnv,
): Promise<AuthIdentity> {

  const token = getBearerToken(event);

  if (!token) {
    const err = new Error("Missing Bearer token");
    (err as any).statusCode = 401;
    throw err;
  }

  const issuer = `https://cognito-idp.${env.region}.amazonaws.com/${env.userPoolId}`;
  const jwks = getJwks(env);

  let payload: any;

  try {
    const result = await jwtVerify(token, jwks, {
      issuer,
    });

    payload = result.payload;
  } catch (err) {
    console.error("❌ JWT VERIFY FAILED:", err);
    (err as any).statusCode = 401;
    throw err;
  }

  if (payload.aud !== env.clientId && payload.client_id !== env.clientId) {
    const err = new Error("Invalid token audience");
    (err as any).statusCode = 401;
    throw err;
  }

  const id = typeof payload.sub === "string" ? payload.sub : null;
  if (!id) {
    const err = new Error("Token missing sub");
    (err as any).statusCode = 401;
    throw err;
  }

  const email = typeof payload.email === "string" ? payload.email : undefined;

  return {
    sub: payload.sub,
    email,
  };
}
