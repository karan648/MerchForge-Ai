import type { Session } from "@supabase/supabase-js";
import type { User } from "@prisma/client";

export class AuthServiceError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "AuthServiceError";
    this.statusCode = statusCode;
  }
}

export type RegisterInput = {
  email: string;
  password: string;
  fullName?: string;
  username?: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type PublicUser = Pick<
  User,
  "id" | "supabaseId" | "email" | "username" | "fullName" | "avatarUrl" | "role" | "onboardingCompleted"
>;

export type AuthResult = {
  user: PublicUser;
  session: Session | null;
  requiresEmailConfirmation: boolean;
};
