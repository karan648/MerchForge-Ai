"use server";

import { revalidatePath } from "next/cache";

import { getSessionUserId } from "@/features/onboarding/server/session-user";
import { getPrismaClient } from "@/server/db/prisma";

type SettingsActionResult =
  | { ok: true }
  | { ok: false; error: string };

type SaveProfileInput = {
  fullName: string;
  bio: string;
  avatarUrl: string;
};

type SaveBrandKitInput = {
  brandName: string;
  logoUrl: string;
  primaryColor: string;
};

// Keep inline avatar payloads bounded so profile records cannot store arbitrarily large blobs.
const MAX_DATA_IMAGE_BYTES = 1_000_000;

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function approximateBase64Bytes(base64Value: string): number {
  const normalized = base64Value.trim();
  if (!normalized) {
    return 0;
  }

  const padding = normalized.endsWith("==") ? 2 : normalized.endsWith("=") ? 1 : 0;
  return Math.floor((normalized.length * 3) / 4) - padding;
}

function isValidDataImage(value: string): boolean {
  if (!value.startsWith("data:image/")) {
    return false;
  }

  const [header, payload] = value.split(",", 2);
  if (!header || !payload) {
    return false;
  }

  const normalizedHeader = header.toLowerCase();
  const isBase64 = normalizedHeader.includes(";base64");

  if (isBase64) {
    const bytes = approximateBase64Bytes(payload);
    return bytes > 0 && bytes <= MAX_DATA_IMAGE_BYTES;
  }

  try {
    const decoded = decodeURIComponent(payload);
    return decoded.length > 0 && decoded.length <= MAX_DATA_IMAGE_BYTES * 2;
  } catch {
    return false;
  }
}

function validateAvatarInput(value: string): boolean {
  if (!value) {
    return true;
  }

  return isValidHttpUrl(value) || isValidDataImage(value);
}

function validateOptionalUrl(value: string): boolean {
  if (!value) {
    return true;
  }

  return isValidHttpUrl(value);
}

async function requireSessionUserId(): Promise<string | null> {
  return getSessionUserId();
}

export async function saveProfileSettingsAction(input: SaveProfileInput): Promise<SettingsActionResult> {
  const userId = await requireSessionUserId();
  if (!userId) {
    return { ok: false, error: "Session expired. Please sign in again." };
  }

  const fullName = input.fullName.trim();
  if (fullName.length < 2) {
    return { ok: false, error: "Name must be at least 2 characters." };
  }

  const bio = input.bio.trim();
  const avatarUrl = input.avatarUrl.trim();
  if (!validateAvatarInput(avatarUrl)) {
    return {
      ok: false,
      error: "Avatar must be a valid http(s) URL or an uploaded image up to 1MB.",
    };
  }

  const prisma = getPrismaClient();

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        fullName,
        bio: bio.length > 0 ? bio : null,
        avatarUrl: avatarUrl.length > 0 ? avatarUrl : null,
      },
    });
  } catch {
    return { ok: false, error: "Unable to update profile settings. Please try again." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard/settings");

  return { ok: true };
}

export async function saveBrandKitSettingsAction(input: SaveBrandKitInput): Promise<SettingsActionResult> {
  const userId = await requireSessionUserId();
  if (!userId) {
    return { ok: false, error: "Session expired. Please sign in again." };
  }

  const brandName = input.brandName.trim();
  if (brandName.length < 2) {
    return { ok: false, error: "Brand name must be at least 2 characters." };
  }

  const primaryColor = input.primaryColor.trim();
  if (primaryColor.length > 0 && !/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(primaryColor)) {
    return { ok: false, error: "Primary color must be a hex value like #895af6." };
  }

  const logoUrl = input.logoUrl.trim();
  if (!validateOptionalUrl(logoUrl)) {
    return { ok: false, error: "Brand logo URL must be a valid http(s) URL." };
  }

  const prisma = getPrismaClient();

  try {
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
          logoUrl: logoUrl.length > 0 ? logoUrl : null,
          primaryColor: primaryColor.length > 0 ? primaryColor : null,
        },
      });
    } else {
      await prisma.brandKit.create({
        data: {
          userId,
          name: brandName,
          logoUrl: logoUrl.length > 0 ? logoUrl : null,
          primaryColor: primaryColor.length > 0 ? primaryColor : null,
        },
      });
    }
  } catch {
    return { ok: false, error: "Unable to update brand kit settings. Please try again." };
  }

  revalidatePath("/dashboard/settings");

  return { ok: true };
}
