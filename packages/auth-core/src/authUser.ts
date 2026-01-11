import { Role } from "./roles";

export interface AuthUser {
  id: string;
  email?: string;
  roles: Role[];
}
