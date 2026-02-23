import { OrderStatus, PaymentStatus, ProductStatus } from "@prisma/client";

import { getPrismaClient } from "@/server/db/prisma";

export type CheckoutProductDetails = {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  currency: string;
  imageUrl: string;
  sellerName: string;
  sellerUsername: string;
  sellerId: string;
};

export type CreateCheckoutOrderInput = {
  productId: string;
  buyerName: string;
  buyerEmail: string;
  quantity: number;
  shippingAddressLine1: string;
  shippingAddressLine2?: string;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingCountry: string;
  buyerId?: string;
};

function firstImageFromJson(value: unknown): string | null {
  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }

  if (Array.isArray(value)) {
    const firstString = value.find((item) => typeof item === "string" && item.trim().length > 0);
    if (typeof firstString === "string") {
      return firstString;
    }
  }

  if (value && typeof value === "object" && "url" in value) {
    const url = (value as { url?: unknown }).url;
    if (typeof url === "string" && url.trim().length > 0) {
      return url;
    }
  }

  return null;
}

export async function getCheckoutProductById(productId: string): Promise<CheckoutProductDetails | null> {
  const prisma = getPrismaClient();
  const product = await prisma.storeProduct.findFirst({
    where: {
      id: productId,
      status: ProductStatus.ACTIVE,
    },
    select: {
      id: true,
      title: true,
      description: true,
      priceCents: true,
      currency: true,
      images: true,
      owner: {
        select: {
          id: true,
          fullName: true,
          username: true,
        },
      },
    },
  });

  if (!product) {
    return null;
  }

  const imageUrl = firstImageFromJson(product.images);
  if (!imageUrl) {
    return null;
  }

  return {
    id: product.id,
    title: product.title,
    description: product.description ?? "AI-generated premium merch from MerchForge AI.",
    priceCents: product.priceCents,
    currency: product.currency,
    imageUrl,
    sellerName: product.owner.fullName?.trim() || product.owner.username,
    sellerUsername: product.owner.username,
    sellerId: product.owner.id,
  };
}

function sanitizeText(value: string): string {
  return value.trim();
}

export async function createCheckoutOrder(input: CreateCheckoutOrderInput): Promise<{
  orderId: string;
  amountTotalCents: number;
  currency: string;
}> {
  const prisma = getPrismaClient();

  const buyerName = sanitizeText(input.buyerName);
  const buyerEmail = sanitizeText(input.buyerEmail).toLowerCase();
  const shippingAddressLine1 = sanitizeText(input.shippingAddressLine1);
  const shippingAddressLine2 = sanitizeText(input.shippingAddressLine2 ?? "");
  const shippingCity = sanitizeText(input.shippingCity);
  const shippingState = sanitizeText(input.shippingState);
  const shippingPostalCode = sanitizeText(input.shippingPostalCode);
  const shippingCountry = sanitizeText(input.shippingCountry);
  const quantity = Math.max(1, Math.min(10, Math.floor(input.quantity || 1)));

  if (!buyerName || buyerName.length < 2) {
    throw new Error("VALIDATION_NAME");
  }

  if (!buyerEmail.includes("@")) {
    throw new Error("VALIDATION_EMAIL");
  }

  if (!shippingAddressLine1 || !shippingCity || !shippingState || !shippingPostalCode || !shippingCountry) {
    throw new Error("VALIDATION_SHIPPING");
  }

  const product = await prisma.storeProduct.findFirst({
    where: {
      id: input.productId,
      status: ProductStatus.ACTIVE,
    },
    select: {
      id: true,
      ownerId: true,
      priceCents: true,
      currency: true,
    },
  });

  if (!product) {
    throw new Error("PRODUCT_NOT_FOUND");
  }

  const amountSubtotalCents = product.priceCents * quantity;
  const amountTotalCents = amountSubtotalCents;

  const knownBuyer = input.buyerId
    ? await prisma.user.findUnique({ where: { id: input.buyerId }, select: { id: true } })
    : await prisma.user.findUnique({ where: { email: buyerEmail }, select: { id: true } });

  const order = await prisma.order.create({
    data: {
      buyerId: knownBuyer?.id ?? null,
      sellerId: product.ownerId,
      storeProductId: product.id,
      status: OrderStatus.PAID,
      paymentStatus: PaymentStatus.PAID,
      amountSubtotalCents,
      amountTotalCents,
      currency: product.currency,
      shippingAddress: {
        fullName: buyerName,
        email: buyerEmail,
        line1: shippingAddressLine1,
        line2: shippingAddressLine2 || null,
        city: shippingCity,
        state: shippingState,
        postalCode: shippingPostalCode,
        country: shippingCountry,
      },
      metadata: {
        source: "checkout_web",
        quantity,
      },
    },
    select: {
      id: true,
    },
  });

  return {
    orderId: order.id,
    amountTotalCents,
    currency: product.currency,
  };
}
