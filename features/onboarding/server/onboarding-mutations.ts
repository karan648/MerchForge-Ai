import { ExperienceLevel, UseCaseType } from "@prisma/client";

import { getPrismaClient } from "@/server/db/prisma";

import type { OnboardingExperience, OnboardingUseCase } from "../types";

export class OnboardingMutationError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "OnboardingMutationError";
    this.statusCode = statusCode;
  }
}

export function isValidUseCase(value: string): value is OnboardingUseCase {
  return value === "PERSONAL" || value === "BUSINESS" || value === "AGENCY";
}

export function isValidExperience(value: string): value is OnboardingExperience {
  return value === "BEGINNER" || value === "ADVANCED";
}

export async function saveUseCaseForUser(userId: string, useCase: string): Promise<void> {
  if (!isValidUseCase(useCase)) {
    throw new OnboardingMutationError("Please select a valid use case.", 400);
  }

  const prisma = getPrismaClient();
  await prisma.user.update({
    where: { id: userId },
    data: {
      useCase: useCase as UseCaseType,
    },
  });
}

export async function saveExperienceForUser(userId: string, experienceLevel: string): Promise<void> {
  if (!isValidExperience(experienceLevel)) {
    throw new OnboardingMutationError("Please select a valid experience level.", 400);
  }

  const prisma = getPrismaClient();
  await prisma.user.update({
    where: { id: userId },
    data: {
      experienceLevel: experienceLevel as ExperienceLevel,
    },
  });
}

type SaveBrandInput = {
  brandName: string;
  logoUrl: string | null;
};

export async function saveBrandForUser(userId: string, input: SaveBrandInput): Promise<void> {
  const brandName = input.brandName.trim();
  if (brandName.length < 2) {
    throw new OnboardingMutationError("Brand name must be at least 2 characters.", 400);
  }

  const prisma = getPrismaClient();
  const existing = await prisma.brandKit.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  if (existing) {
    await prisma.brandKit.update({
      where: { id: existing.id },
      data: {
        name: brandName,
        logoUrl: input.logoUrl,
      },
    });
    return;
  }

  await prisma.brandKit.create({
    data: {
      userId,
      name: brandName,
      logoUrl: input.logoUrl,
    },
  });
}

export async function completeOnboardingForUser(userId: string): Promise<void> {
  const prisma = getPrismaClient();
  await prisma.user.update({
    where: { id: userId },
    data: {
      onboardingCompleted: true,
    },
  });
}
