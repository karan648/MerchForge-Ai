"use server";

import { revalidatePath } from "next/cache";

import { getSessionUserId } from "@/features/onboarding/server/session-user";
import { getPrismaClient } from "@/server/db/prisma";

export type StorefrontData = {
  id: string;
  userId: string;
  storeName: string;
  slug: string;
  bio: string | null;
  bannerUrl: string | null;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string | null;
  socialLinks: Record<string, string> | null;
  customDomain: string | null;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type CreateStorefrontInput = {
  storeName: string;
  bio?: string;
  bannerUrl?: string;
  logoUrl?: string;
  primaryColor?: string;
};

type UpdateStorefrontInput = {
  storeName?: string;
  bio?: string;
  bannerUrl?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  socialLinks?: Record<string, string>;
  isPublished?: boolean;
};

type StorefrontActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

type ToggleStoreFollowActionResult =
  | { ok: true; isFollowing: boolean; followerCount: number }
  | { ok: false; error: string };

const MAX_DATA_IMAGE_BYTES = 5_000_000;

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 50);
}

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
  if (!normalized) return 0;
  const padding = normalized.endsWith("==") ? 2 : normalized.endsWith("=") ? 1 : 0;
  return Math.floor((normalized.length * 3) / 4) - padding;
}

function isValidDataImage(value: string): boolean {
  if (!value.startsWith("data:image/")) return false;
  const [header, payload] = value.split(",", 2);
  if (!header || !payload) return false;
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

function isValidImageUrl(value: string): boolean {
  if (!value) return false;
  return isValidHttpUrl(value) || isValidDataImage(value);
}

function isValidHexColor(value: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value);
}

export async function getStorefrontByUserId(userId: string): Promise<StorefrontData | null> {
  const prisma = getPrismaClient();

  const storefront = await prisma.storefront.findUnique({
    where: { userId },
  });

  if (!storefront) return null;

  return {
    id: storefront.id,
    userId: storefront.userId,
    storeName: storefront.storeName,
    slug: storefront.slug,
    bio: storefront.bio,
    bannerUrl: storefront.bannerUrl,
    logoUrl: storefront.logoUrl,
    primaryColor: storefront.primaryColor,
    secondaryColor: storefront.secondaryColor,
    socialLinks: storefront.socialLinks as Record<string, string> | null,
    customDomain: storefront.customDomain,
    isPublished: storefront.isPublished,
    createdAt: storefront.createdAt,
    updatedAt: storefront.updatedAt,
  };
}

export async function getStorefrontBySlug(slug: string): Promise<StorefrontData | null> {
  const prisma = getPrismaClient();

  const storefront = await prisma.storefront.findUnique({
    where: { slug },
  });

  if (!storefront) return null;

  return {
    id: storefront.id,
    userId: storefront.userId,
    storeName: storefront.storeName,
    slug: storefront.slug,
    bio: storefront.bio,
    bannerUrl: storefront.bannerUrl,
    logoUrl: storefront.logoUrl,
    primaryColor: storefront.primaryColor,
    secondaryColor: storefront.secondaryColor,
    socialLinks: storefront.socialLinks as Record<string, string> | null,
    customDomain: storefront.customDomain,
    isPublished: storefront.isPublished,
    createdAt: storefront.createdAt,
    updatedAt: storefront.updatedAt,
  };
}

export async function getStorefrontForCurrentUser(): Promise<StorefrontActionResult<StorefrontData | null>> {
  const userId = await getSessionUserId();
  if (!userId) {
    return { ok: false, error: "Session expired. Please sign in again." };
  }

  const storefront = await getStorefrontByUserId(userId);
  return { ok: true, data: storefront };
}

export async function createStorefront(
  input: CreateStorefrontInput,
): Promise<StorefrontActionResult<StorefrontData>> {
  const userId = await getSessionUserId();
  if (!userId) {
    return { ok: false, error: "Session expired. Please sign in again." };
  }

  const storeName = input.storeName.trim();
  if (storeName.length < 2 || storeName.length > 80) {
    return { ok: false, error: "Store name must be between 2 and 80 characters." };
  }

  const bio = input.bio?.trim() || null;
  if (bio && bio.length > 420) {
    return { ok: false, error: "Bio must be 420 characters or less." };
  }

  const bannerUrl = input.bannerUrl?.trim() || null;
  if (bannerUrl && !isValidImageUrl(bannerUrl)) {
    return { ok: false, error: "Banner must be a valid URL or image up to 5MB." };
  }

  const logoUrl = input.logoUrl?.trim() || null;
  if (logoUrl && !isValidImageUrl(logoUrl)) {
    return { ok: false, error: "Logo must be a valid URL or image up to 5MB." };
  }

  const primaryColor = input.primaryColor?.trim() || "#895af6";
  if (!isValidHexColor(primaryColor)) {
    return { ok: false, error: "Theme color must be a valid hex code like #895af6." };
  }

  const prisma = getPrismaClient();

  try {
    const existingStorefront = await prisma.storefront.findUnique({
      where: { userId },
    });

    if (existingStorefront) {
      return { ok: false, error: "You already have a storefront. Use update instead." };
    }

    const baseSlug = generateSlug(storeName);
    let slug = baseSlug;
    let counter = 1;

    while (await prisma.storefront.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const storefront = await prisma.storefront.create({
      data: {
        userId,
        storeName,
        slug,
        bio,
        bannerUrl,
        logoUrl,
        primaryColor,
        isPublished: false,
      },
    });

    revalidatePath("/dashboard/storefront");
    revalidatePath("/dashboard/store-builder");
    revalidatePath(`/store/${userId}`);

    return {
      ok: true,
      data: {
        id: storefront.id,
        userId: storefront.userId,
        storeName: storefront.storeName,
        slug: storefront.slug,
        bio: storefront.bio,
        bannerUrl: storefront.bannerUrl,
        logoUrl: storefront.logoUrl,
        primaryColor: storefront.primaryColor,
        secondaryColor: storefront.secondaryColor,
        socialLinks: storefront.socialLinks as Record<string, string> | null,
        customDomain: storefront.customDomain,
        isPublished: storefront.isPublished,
        createdAt: storefront.createdAt,
        updatedAt: storefront.updatedAt,
      },
    };
  } catch (error) {
    console.error("Create storefront error:", error);
    return { ok: false, error: "Unable to create storefront. Please try again." };
  }
}

export async function updateStorefront(
  input: UpdateStorefrontInput,
): Promise<StorefrontActionResult<StorefrontData>> {
  const userId = await getSessionUserId();
  if (!userId) {
    return { ok: false, error: "Session expired. Please sign in again." };
  }

  const updateData: {
    storeName?: string;
    bio?: string | null;
    bannerUrl?: string | null;
    logoUrl?: string | null;
    primaryColor?: string;
    secondaryColor?: string | null;
    socialLinks?: Record<string, string>;
    isPublished?: boolean;
  } = {};

  if (input.storeName !== undefined) {
    const storeName = input.storeName.trim();
    if (storeName.length < 2 || storeName.length > 80) {
      return { ok: false, error: "Store name must be between 2 and 80 characters." };
    }
    updateData.storeName = storeName;
  }

  if (input.bio !== undefined) {
    const bio = input.bio.trim() || null;
    if (bio && bio.length > 420) {
      return { ok: false, error: "Bio must be 420 characters or less." };
    }
    updateData.bio = bio;
  }

  if (input.bannerUrl !== undefined) {
    const bannerUrl = input.bannerUrl.trim() || null;
    if (bannerUrl && !isValidImageUrl(bannerUrl)) {
      return { ok: false, error: "Banner must be a valid URL or image up to 5MB." };
    }
    updateData.bannerUrl = bannerUrl;
  }

  if (input.logoUrl !== undefined) {
    const logoUrl = input.logoUrl.trim() || null;
    if (logoUrl && !isValidImageUrl(logoUrl)) {
      return { ok: false, error: "Logo must be a valid URL or image up to 5MB." };
    }
    updateData.logoUrl = logoUrl;
  }

  if (input.primaryColor !== undefined) {
    const primaryColor = input.primaryColor.trim();
    if (!isValidHexColor(primaryColor)) {
      return { ok: false, error: "Theme color must be a valid hex code like #895af6." };
    }
    updateData.primaryColor = primaryColor;
  }

  if (input.secondaryColor !== undefined) {
    updateData.secondaryColor = input.secondaryColor.trim() || null;
  }

  if (input.socialLinks !== undefined) {
    updateData.socialLinks = input.socialLinks;
  }

  if (input.isPublished !== undefined) {
    updateData.isPublished = input.isPublished;
  }

  const prisma = getPrismaClient();

  try {
    const existingStorefront = await prisma.storefront.findUnique({
      where: { userId },
    });

    if (!existingStorefront) {
      return { ok: false, error: "Storefront not found. Create one first." };
    }

    const storefront = await prisma.storefront.update({
      where: { userId },
      data: updateData,
    });

    revalidatePath("/dashboard/storefront");
    revalidatePath("/dashboard/store-builder");
    revalidatePath(`/store/${userId}`);

    return {
      ok: true,
      data: {
        id: storefront.id,
        userId: storefront.userId,
        storeName: storefront.storeName,
        slug: storefront.slug,
        bio: storefront.bio,
        bannerUrl: storefront.bannerUrl,
        logoUrl: storefront.logoUrl,
        primaryColor: storefront.primaryColor,
        secondaryColor: storefront.secondaryColor,
        socialLinks: storefront.socialLinks as Record<string, string> | null,
        customDomain: storefront.customDomain,
        isPublished: storefront.isPublished,
        createdAt: storefront.createdAt,
        updatedAt: storefront.updatedAt,
      },
    };
  } catch (error) {
    console.error("Update storefront error:", error);
    return { ok: false, error: "Unable to update storefront. Please try again." };
  }
}

export async function publishStorefront(): Promise<StorefrontActionResult<StorefrontData>> {
  const userId = await getSessionUserId();
  if (!userId) {
    return { ok: false, error: "Session expired. Please sign in again." };
  }

  const prisma = getPrismaClient();

  try {
    const existingStorefront = await prisma.storefront.findUnique({
      where: { userId },
    });

    if (!existingStorefront) {
      return { ok: false, error: "Storefront not found. Create one first." };
    }

    const storefront = await prisma.storefront.update({
      where: { userId },
      data: { isPublished: true },
    });

    revalidatePath("/dashboard/storefront");
    revalidatePath("/dashboard/store-builder");
    revalidatePath(`/store/${userId}`);

    return {
      ok: true,
      data: {
        id: storefront.id,
        userId: storefront.userId,
        storeName: storefront.storeName,
        slug: storefront.slug,
        bio: storefront.bio,
        bannerUrl: storefront.bannerUrl,
        logoUrl: storefront.logoUrl,
        primaryColor: storefront.primaryColor,
        secondaryColor: storefront.secondaryColor,
        socialLinks: storefront.socialLinks as Record<string, string> | null,
        customDomain: storefront.customDomain,
        isPublished: storefront.isPublished,
        createdAt: storefront.createdAt,
        updatedAt: storefront.updatedAt,
      },
    };
  } catch (error) {
    console.error("Publish storefront error:", error);
    return { ok: false, error: "Unable to publish storefront. Please try again." };
  }
}

export async function deleteStorefront(): Promise<StorefrontActionResult> {
  const userId = await getSessionUserId();
  if (!userId) {
    return { ok: false, error: "Session expired. Please sign in again." };
  }

  const prisma = getPrismaClient();

  try {
    const existingStorefront = await prisma.storefront.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!existingStorefront) {
      return { ok: false, error: "Storefront not found." };
    }

    await prisma.storefront.delete({
      where: { userId },
    });

    revalidatePath("/dashboard/storefront");
    revalidatePath("/dashboard/store-builder");
    revalidatePath(`/store/${userId}`);

    return { ok: true, data: undefined };
  } catch (error) {
    console.error("Delete storefront error:", error);
    return { ok: false, error: "Unable to delete storefront. Please try again." };
  }
}

export async function toggleStoreFollowAction(creatorId: string): Promise<ToggleStoreFollowActionResult> {
  const followerId = await getSessionUserId();
  if (!followerId) {
    return { ok: false, error: "Please sign in to follow this creator." };
  }

  const normalizedCreatorId = creatorId.trim();
  if (!normalizedCreatorId) {
    return { ok: false, error: "Creator identifier is required." };
  }

  if (normalizedCreatorId === followerId) {
    return { ok: false, error: "You cannot follow your own store." };
  }

  const prisma = getPrismaClient();

  try {
    const creatorExists = await prisma.user.findUnique({
      where: { id: normalizedCreatorId },
      select: { id: true },
    });

    if (!creatorExists) {
      return { ok: false, error: "Store creator not found." };
    }

    const existingFollow = await prisma.storefrontFollow.findUnique({
      where: {
        followerId_creatorId: {
          followerId,
          creatorId: normalizedCreatorId,
        },
      },
      select: { id: true },
    });

    let isFollowing = false;

    if (existingFollow) {
      await prisma.storefrontFollow.delete({
        where: { id: existingFollow.id },
      });
    } else {
      await prisma.storefrontFollow.create({
        data: {
          followerId,
          creatorId: normalizedCreatorId,
        },
      });
      isFollowing = true;
    }

    const followerCount = await prisma.storefrontFollow.count({
      where: { creatorId: normalizedCreatorId },
    });

    revalidatePath(`/store/${normalizedCreatorId}`);
    revalidatePath("/dashboard/storefront");

    return {
      ok: true,
      isFollowing,
      followerCount,
    };
  } catch (error) {
    console.error("Toggle storefront follow error:", error);
    return { ok: false, error: "Unable to update follow status right now." };
  }
}
