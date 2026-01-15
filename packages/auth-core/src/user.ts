import { Role } from "./roles";

export interface AuthUser {
  id: string;        // Cognito `sub`
  email?: string;
  roles: Role[];
}
