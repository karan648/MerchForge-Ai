import type { User } from "@prisma/client";

import { getPrismaClient } from "@/server/db/prisma";

type EnsureUserProfileInput = {
  supabaseId: string;
  email: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  usernameHint?: string | null;
};

function normalizeUsername(candidate: string): string {
  const normalized = candidate
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 24);

  return normalized.length > 0 ? normalized : "creator";
}

function randomSuffix(length = 4): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let output = "";

  for (let i = 0; i < length; i += 1) {
    output += chars[Math.floor(Math.random() * chars.length)];
  }

  return output;
}

async function getAvailableUsername(base: string): Promise<string> {
  const prisma = getPrismaClient();
  const normalizedBase = normalizeUsername(base);

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const candidate = attempt === 0 ? normalizedBase : `${normalizedBase}_${randomSuffix(3)}`;
    const existing = await prisma.user.findUnique({ where: { username: candidate } });

    if (!existing) {
      return candidate;
    }
  }

  return `${normalizedBase}_${randomSuffix(6)}`;
}

async function generateUniqueReferralCode(base: string): Promise<string> {
  const prisma = getPrismaClient();
  const seed = base.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6) || "MERCH";

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const code = `${seed}${Math.floor(1000 + Math.random() * 9000)}`;
    const existing = await prisma.user.findUnique({ where: { referralCode: code } });

    if (!existing) {
      return code;
    }
  }

  return `MF${Date.now().toString().slice(-8)}`;
}

export async function ensureUserProfile(input: EnsureUserProfileInput): Promise<User> {
  const prisma = getPrismaClient();

  const existing = await prisma.user.findUnique({
    where: { supabaseId: input.supabaseId },
  });

  if (existing) {
    return prisma.user.update({
      where: { id: existing.id },
      data: {
        email: input.email,
        fullName: input.fullName ?? existing.fullName,
        avatarUrl: input.avatarUrl ?? existing.avatarUrl,
        lastLoginAt: new Date(),
      },
    });
  }

  const usernameBase =
    input.usernameHint ??
    input.fullName ??
    input.email.split("@")[0] ??
    `creator_${input.supabaseId.slice(0, 6)}`;

  const username = await getAvailableUsername(usernameBase);
  const referralCode = await generateUniqueReferralCode(username);

  return prisma.user.create({
    data: {
      supabaseId: input.supabaseId,
      email: input.email,
      fullName: input.fullName,
      avatarUrl: input.avatarUrl,
      username,
      referralCode,
      lastLoginAt: new Date(),
    },
  });
}
