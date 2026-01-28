import { Role } from "./roles";

export interface AppUser {
  id: string;
  email?: string;
}

export interface AuthIdentity {
  sub: string;
  email?: string;
}