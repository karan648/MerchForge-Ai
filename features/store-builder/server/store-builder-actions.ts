"use server";

import { ProductStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { getSessionUserId } from "@/features/onboarding/server/session-user";
import { getPrismaClient } from "@/server/db/prisma";

type PublishStorefrontInput = {
  storeName: string;
  bio: string;
  bannerUrl: string;
  primaryColor: string;
};

type StoreBuilderActionResult =
  | { ok: true; publishedCount: number; message: string }
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

function isValidBannerInput(value: string): boolean {
  if (!value) {
    return false;
  }

  return isValidHttpUrl(value) || isValidDataImage(value);
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
  if (!isValidBannerInput(bannerUrl)) {
    return {
      ok: false,
      error: "Banner must be a valid http(s) URL or uploaded image up to 5MB.",
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
          brandKits: {
            orderBy: { createdAt: "asc" },
            take: 1,
            select: { id: true, name: true },
          },
        },
      });

      if (!user) {
        throw new Error("USER_NOT_FOUND");
      }

      await tx.user.update({
        where: { id: userId },
        data: {
          fullName: storeName,
          bio: bio.length > 0 ? bio : null,
        },
      });

      if (user.brandKits[0]) {
        await tx.brandKit.update({
          where: { id: user.brandKits[0].id },
          data: {
            name: user.brandKits[0].name,
            logoUrl: bannerUrl,
            primaryColor,
          },
        });
      } else {
        await tx.brandKit.create({
          data: {
            userId,
            name: "Default",
            logoUrl: bannerUrl,
            primaryColor,
          },
        });
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
    };
  } catch (error) {
    if (error instanceof Error && error.message === "USER_NOT_FOUND") {
      return { ok: false, error: "Unable to resolve your user account." };
    }

    return { ok: false, error: "Unable to publish store right now. Please try again." };
  }
}
