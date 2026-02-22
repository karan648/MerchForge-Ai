import { randomUUID } from "node:crypto";

import type { User } from "@prisma/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

import { createSupabaseAnonClient } from "@/server/auth/supabase-provider";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { getPrismaClient } from "@/server/db/prisma";
import { ensureUserProfile } from "@/server/repositories/user-repository";
import {
  AuthServiceError,
  type AuthResult,
  type LoginInput,
  type PublicUser,
  type RegisterInput,
} from "@/server/services/auth/auth-types";

function sanitizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function validatePassword(password: string): void {
  if (password.length < 8) {
    throw new AuthServiceError("Password must be at least 8 characters.", 400);
  }
}

function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    supabaseId: user.supabaseId,
    email: user.email,
    username: user.username,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl,
    role: user.role,
    onboardingCompleted: user.onboardingCompleted,
  };
}

function pullMeta(supabaseUser: SupabaseUser, key: string): string | undefined {
  const value = supabaseUser.user_metadata?.[key];
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }

  return undefined;
}

function mapLoginError(message: string): AuthServiceError {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return new AuthServiceError("Invalid email or password.", 401);
  }

  if (normalized.includes("email not confirmed")) {
    return new AuthServiceError("Please verify your email before signing in.", 403);
  }

  if (normalized.includes("email rate limit exceeded")) {
    return new AuthServiceError(
      "Too many sign-in attempts from this IP. Please wait a minute and try again.",
      429,
    );
  }

  return new AuthServiceError(message, 401);
}

export async function registerWithEmail(input: RegisterInput): Promise<AuthResult> {
  const email = sanitizeEmail(input.email);
  validatePassword(input.password);
  const prisma = getPrismaClient();

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AuthServiceError("An account with this email already exists. Try signing in.", 409);
  }

  const passwordHash = await hashPassword(input.password);

  const profile = await ensureUserProfile({
    supabaseId: `local_${randomUUID()}`,
    email,
    fullName: input.fullName,
    usernameHint: input.username,
  });

  const updatedUser = await prisma.user.update({
    where: { id: profile.id },
    data: {
      passwordHash,
      lastLoginAt: new Date(),
    },
  });

  return {
    user: toPublicUser(updatedUser),
    session: null,
    requiresEmailConfirmation: false,
  };
}

export async function loginWithEmail(input: LoginInput): Promise<AuthResult> {
  const email = sanitizeEmail(input.email);
  const prisma = getPrismaClient();

  const localUser = await prisma.user.findUnique({
    where: { email },
  });

  if (localUser?.passwordHash) {
    const isValidPassword = await verifyPassword(input.password, localUser.passwordHash);

    if (!isValidPassword) {
      throw new AuthServiceError("Invalid email or password.", 401);
    }

    const updatedUser = await prisma.user.update({
      where: { id: localUser.id },
      data: {
        lastLoginAt: new Date(),
      },
    });

    return {
      user: toPublicUser(updatedUser),
      session: null,
      requiresEmailConfirmation: false,
    };
  }

  const supabase = createSupabaseAnonClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: input.password,
  });

  if (error) {
    throw mapLoginError(error.message);
  }

  if (!data.user || !data.session) {
    throw new AuthServiceError("Invalid credentials.", 401);
  }

  const profile = await ensureUserProfile({
    supabaseId: data.user.id,
    email: data.user.email ?? email,
    fullName: pullMeta(data.user, "full_name"),
    avatarUrl: pullMeta(data.user, "avatar_url"),
    usernameHint: pullMeta(data.user, "username"),
  });

  return {
    user: toPublicUser(profile),
    session: data.session,
    requiresEmailConfirmation: false,
  };
}
