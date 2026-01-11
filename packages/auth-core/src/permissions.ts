import { Role } from "./roles";

export function hasRole(
  userRoles: Role[],
  required: Role | Role[]
): boolean {
  const requiredRoles = Array.isArray(required)
    ? required
    : [required];

  return requiredRoles.some(role => userRoles.includes(role));
}
