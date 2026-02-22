"use server";

import { ProductStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { getSessionUserId } from "@/features/onboarding/server/session-user";
import { getPrismaClient } from "@/server/db/prisma";

type PublishStorefrontInput = {
  storeName: string;
  bio: string;
  bannerUrl: string;
  logoUrl?: string;
  primaryColor: string;
};

type StoreBuilderActionResult =
  | { ok: true; publishedCount: number; message: string; storefrontId: string }
  | { ok: false; error: string };

const MAX_DATA_IMAGE_BYTES = 5_000_000;

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

function isValidImageUrl(value: string | undefined): boolean {
  if (!value) return true;
  return isValidHttpUrl(value) || isValidDataImage(value);
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 50);
}

export async function publishStorefrontAction(
  input: PublishStorefrontInput,
): Promise<StoreBuilderActionResult> {
  const userId = await getSessionUserId();
  if (!userId) {
    return { ok: false, error: "Session expired. Please sign in again." };
  }

  const storeName = input.storeName.trim();
  if (storeName.length < 2 || storeName.length > 80) {
    return { ok: false, error: "Store name must be between 2 and 80 characters." };
  }

  const bio = input.bio.trim();
  if (bio.length > 420) {
    return { ok: false, error: "Bio must be 420 characters or less." };
  }

  const bannerUrl = input.bannerUrl.trim();
  if (bannerUrl && !isValidImageUrl(bannerUrl)) {
    return {
      ok: false,
      error: "Banner must be a valid URL or uploaded image up to 5MB.",
    };
  }

  const logoUrl = input.logoUrl?.trim();
  if (logoUrl && !isValidImageUrl(logoUrl)) {
    return {
      ok: false,
      error: "Logo must be a valid URL or uploaded image up to 5MB.",
    };
  }

  const primaryColor = input.primaryColor.trim();
  if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(primaryColor)) {
    return { ok: false, error: "Theme color must be a valid hex code like #895af6." };
  }

  const prisma = getPrismaClient();

  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: {
          username: true,
          storefront: {
            select: { id: true, slug: true },
          },
        },
      });

      if (!user) {
        throw new Error("USER_NOT_FOUND");
      }

      let storefrontId: string;

      if (user.storefront) {
        await tx.storefront.update({
          where: { id: user.storefront.id },
          data: {
            storeName,
            bio: bio.length > 0 ? bio : null,
            bannerUrl: bannerUrl.length > 0 ? bannerUrl : null,
            logoUrl: logoUrl && logoUrl.length > 0 ? logoUrl : null,
            primaryColor,
            isPublished: true,
          },
        });
        storefrontId = user.storefront.id;
      } else {
        const baseSlug = generateSlug(storeName);
        let slug = baseSlug;
        let counter = 1;

        let existingSlug = await tx.storefront.findUnique({
          where: { slug },
          select: { id: true },
        });

        while (existingSlug) {
          slug = `${baseSlug}-${counter}`;
          counter++;
          existingSlug = await tx.storefront.findUnique({
            where: { slug },
            select: { id: true },
          });
        }

        const newStorefront = await tx.storefront.create({
          data: {
            userId,
            storeName,
            slug,
            bio: bio.length > 0 ? bio : null,
            bannerUrl: bannerUrl.length > 0 ? bannerUrl : null,
            logoUrl: logoUrl && logoUrl.length > 0 ? logoUrl : null,
            primaryColor,
            isPublished: true,
          },
        });
        storefrontId = newStorefront.id;
      }

      const publishResult = await tx.storeProduct.updateMany({
        where: {
          ownerId: userId,
          status: ProductStatus.DRAFT,
        },
        data: {
          status: ProductStatus.ACTIVE,
        },
      });

      return {
        username: user.username,
        publishedCount: publishResult.count,
        storefrontId,
      };
    });

    revalidatePath("/dashboard/store-builder");
    revalidatePath("/dashboard/storefront");
    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard/profile");
    revalidatePath(`/store/${result.username}`);

    const message =
      result.publishedCount > 0
        ? `Store published. ${result.publishedCount} draft product${result.publishedCount === 1 ? "" : "s"} are now live.`
        : "Store settings published successfully.";

    return {
      ok: true,
      publishedCount: result.publishedCount,
      message,
      storefrontId: result.storefrontId,
    };
  } catch (error) {
    if (error instanceof Error && error.message === "USER_NOT_FOUND") {
      return { ok: false, error: "Unable to resolve your user account." };
    }

    console.error("Publish storefront error:", error);
    return { ok: false, error: "Unable to publish store right now. Please try again." };
  }
}

export async function saveStorefrontDraftAction(
  input: PublishStorefrontInput,
): Promise<StoreBuilderActionResult> {
  const userId = await getSessionUserId();
  if (!userId) {
    return { ok: false, error: "Session expired. Please sign in again." };
  }

  const storeName = input.storeName.trim();
  if (storeName.length < 2 || storeName.length > 80) {
    return { ok: false, error: "Store name must be between 2 and 80 characters." };
  }

  const bio = input.bio.trim();
  if (bio.length > 420) {
    return { ok: false, error: "Bio must be 420 characters or less." };
  }

  const bannerUrl = input.bannerUrl.trim();
  if (bannerUrl && !isValidImageUrl(bannerUrl)) {
    return {
      ok: false,
      error: "Banner must be a valid URL or uploaded image up to 5MB.",
    };
  }

  const logoUrl = input.logoUrl?.trim();
  if (logoUrl && !isValidImageUrl(logoUrl)) {
    return {
      ok: false,
      error: "Logo must be a valid URL or uploaded image up to 5MB.",
    };
  }

  const primaryColor = input.primaryColor.trim();
  if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(primaryColor)) {
    return { ok: false, error: "Theme color must be a valid hex code like #895af6." };
  }

  const prisma = getPrismaClient();

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        username: true,
        storefront: {
          select: { id: true, slug: true },
        },
      },
    });

    if (!user) {
      return { ok: false, error: "Unable to resolve your user account." };
    }

    let storefrontId: string;

    if (user.storefront) {
      await prisma.storefront.update({
        where: { id: user.storefront.id },
        data: {
          storeName,
          bio: bio.length > 0 ? bio : null,
          bannerUrl: bannerUrl.length > 0 ? bannerUrl : null,
          logoUrl: logoUrl && logoUrl.length > 0 ? logoUrl : null,
          primaryColor,
        },
      });
      storefrontId = user.storefront.id;
    } else {
      const baseSlug = generateSlug(storeName);
      let slug = baseSlug;
      let counter = 1;

      let existingSlug = await prisma.storefront.findUnique({
        where: { slug },
        select: { id: true },
      });

      while (existingSlug) {
        slug = `${baseSlug}-${counter}`;
        counter++;
        existingSlug = await prisma.storefront.findUnique({
          where: { slug },
          select: { id: true },
        });
      }

      const newStorefront = await prisma.storefront.create({
        data: {
          userId,
          storeName,
          slug,
          bio: bio.length > 0 ? bio : null,
          bannerUrl: bannerUrl.length > 0 ? bannerUrl : null,
          logoUrl: logoUrl && logoUrl.length > 0 ? logoUrl : null,
          primaryColor,
          isPublished: false,
        },
      });
      storefrontId = newStorefront.id;
    }

    revalidatePath("/dashboard/store-builder");
    revalidatePath("/dashboard/storefront");

    return {
      ok: true,
      publishedCount: 0,
      message: "Draft saved successfully.",
      storefrontId,
    };
  } catch (error) {
    console.error("Save storefront draft error:", error);
    return { ok: false, error: "Unable to save draft. Please try again." };
  }
}
