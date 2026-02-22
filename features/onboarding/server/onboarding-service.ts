import { cookies } from "next/headers";

import { AUTH_COOKIE_NAMES } from "@/server/auth/session-cookie";
import { getPrismaClient } from "@/server/db/prisma";

import type { OnboardingSession } from "../types";

export async function getOnboardingSession(): Promise<OnboardingSession | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(AUTH_COOKIE_NAMES.userId)?.value;

  if (!userId) {
    return null;
  }

  const prisma = getPrismaClient();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      fullName: true,
      avatarUrl: true,
      bio: true,
      useCase: true,
      experienceLevel: true,
      onboardingCompleted: true,
      brandKits: {
        orderBy: { createdAt: "asc" },
        take: 1,
        select: {
          id: true,
          name: true,
          logoUrl: true,
          primaryColor: true,
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    useCase: user.useCase,
    experienceLevel:
      user.experienceLevel === "BEGINNER" || user.experienceLevel === "ADVANCED"
        ? user.experienceLevel
        : null,
    onboardingCompleted: user.onboardingCompleted,
    brandKit: user.brandKits[0] ?? null,
  };
}
