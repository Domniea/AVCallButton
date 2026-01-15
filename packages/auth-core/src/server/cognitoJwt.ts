// packages/auth-core/src/server/cognitoJwt.ts
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { createRemoteJWKSet, jwtVerify } from "jose";
import type { AuthUser } from "../user";
import { ROLES, type Role } from "../roles";

type CognitoJwtEnv = {
  region: string;
  userPoolId: string;
  clientId: string;
};

function getBearerToken(event: APIGatewayProxyEventV2): string | null {
  const h = event.headers ?? {};
  const auth = h.authorization ?? h.Authorization;
  if (!auth) return null;
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

function rolesFromClaims(claims: Record<string, unknown>): Role[] {
  // If you use Cognito Groups later, they show up here:
  const groups = claims["cognito:groups"];
  const list = Array.isArray(groups) ? groups : [];

  // Only allow known roles through (drops unknown strings)
  const allowed = new Set(Object.values(ROLES));
  return list.filter((x): x is Role => typeof x === "string" && allowed.has(x as any));
}

let jwksCache: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJwks(env: CognitoJwtEnv) {
  if (jwksCache) return jwksCache;
  const issuer = `https://cognito-idp.${env.region}.amazonaws.com/${env.userPoolId}`;
  jwksCache = createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`));
  return jwksCache;
}

export async function requireAuthUser(
  event: APIGatewayProxyEventV2,
  env: CognitoJwtEnv
): Promise<AuthUser> {
  const token = getBearerToken(event);
  if (!token) {
    const err = new Error("Missing Bearer token");
    (err as any).statusCode = 401;
    throw err;
  }

  const issuer = `https://cognito-idp.${env.region}.amazonaws.com/${env.userPoolId}`;
  const jwks = getJwks(env);

  const { payload } = await jwtVerify(token, jwks, {
    issuer,
    audience: env.clientId,
  });

  // Minimal claims we care about now
  const id = typeof payload.sub === "string" ? payload.sub : undefined;
  if (!id) {
    const err = new Error("Token missing sub");
    (err as any).statusCode = 401;
    throw err;
  }

  const email = typeof payload.email === "string" ? payload.email : undefined;

  return {
    id,
    email,
    roles: rolesFromClaims(payload as any),
  };
}
