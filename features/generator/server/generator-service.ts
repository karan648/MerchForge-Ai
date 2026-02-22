import {
  AiProvider,
  CreditUsageType,
  DesignStatus,
  GarmentType,
  GenerationStatus,
  MockupStatus,
  PlanTier,
  PodProvider,
  Prisma,
  ProductStatus,
  SubscriptionStatus,
} from "@prisma/client";

import { getPrismaClient } from "@/server/db/prisma";

import {
  STYLE_PRESETS,
  type GenerateDesignInput,
  type GenerateDesignResult,
  type GeneratedVariation,
  type GeneratorActionType,
  type GeneratorErrorCode,
  type GeneratorPromptHistoryItem,
  type GeneratorVariationActionInput,
  type GeneratorVariationActionResult,
  type GeneratorWorkspaceOverview,
  type StylePreset,
} from "../types";

const MOCK_GENERATION_IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAPSjjvewf3fpztpQFQlVfm9zG6IvAbIWjOTJVabrTBIiaLE8V79jNAQQrN44bKUkTge40gkmyl2CNa6wMYFfyNuEcMtu-j0nvcGkQXQmSnu0RLZ7nnHAMx6lHBp7vO362R_ukQoD-BTRYugJGd-41FqA9DuusQiSbsATk9sk5vPn4XxlDiT0mwp-kg6poHa6yPGeErh6vqx__OwvR8x9JGa-x2ETv1OK53dS4fhFz3izSmdNqv5ZqDofTBUflUHXHfQcD4UXQYw6-T",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBYTX7ML9nQkBRu5N04tb4y4I4xCos-9ko9WakFlx0XXQk5QRFTRKfHqFb6_kG37fgjIkoy-f5ge8AbL2JbFuxpTMm_CL7i7DnSVFf8wZh0mp8bVZvF0TEf5oBB_CfnI8inGD4vfuZ4jJPY5E77z_evL3gsBN8_3Uw-wZAo_caQACM_LdKwLcDgMSGHvih-WWbB2XeoLEp5BZwZVdNP4Q8c8l6UojfsjjEMqxWgVtukrXHc5YD4xHlDIdapX8eNjX1F-gpoMufipCJF",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD2R4H1iXzuH5xEaGvZdISqWyqNyI_JbkmmGY9RI8sI-mFdmbbW4KNoozRdpAKYsUfrwQNBtRcsejXCpjVM1-FV6S62D4mFmD3aWWk1rHcK4327WsfrQf4DJEipzZ2nsJNgilY_E5ebSGNo5LaOM7UfUiGybAQ1TO9baPjwq1ycV-oHVcjafBXeRa63GhTqIal-17N1k0obyAgI-IK3BFMRu0xCrFmCXH56zkWWWek13d6nFf6NLuLRtnJXVhxwcIq_BOrvNu9fqLus",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBr5CXemqvcBTAOq8KEK-20fZWHyXOJr8E8pFNg2adRVj0DGZK0WtuwnW1NkI354d74CfHlUSE7eurlmDFAKvcN-HF6j8tG7wOxGX9gW4ym39iwUUf5ckbC83nNHio72J8KItN4tHPv7Eqm31mMvKknJW9k6CWqi-XFcKqqqYeBTKmeo-XroaydmtuIHxsH6utcliNjZ_skuMnm3njO4kGRdewVnhmWq6nFabDZ6Hi3aARy4UJSrzD5lkzAID7CrGiZkAHlG50ex8T9",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAG5pzO_oukCxTDkyvuGH6ra126nPsjJvsvUPwI067tAYLBMZBBH9ChrLNpXbDp0M6qGOObJUHWRv8Fq_dQL4y9IJk6lr-54350qb-t7DGw65WKlcwC3CLENb-andQTNOMBQLmws5SAm8YIYEBx5pO-n24mp00R3bIJZThzDuNnjPsP622bWIldytjdjxrsUfO-NYJahlO3n9v2pLjat7iZoV7v222brAhxnbC1kPiWAkGoBzI7S2W0aNCm_2MLlOHPpGXuJ9-8NJTN",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAC955hEiy4cGXekut9EakQMUIiSSe-7DAsuq4BRFtJ64j8UzojMWzgGIpX6djAwOn5-HEX0RAD9Jro8VXqj77PAWoer7GbPQP7lkMEuIH8yCNE8wpm8OOza1OxR1EVwH3sJm7NaKf39dAZrv2bbcX6JbD4JklMwaZVAyf4uDs7ftPCImAHNNgFyKN8J3cfwRabg2nahIvqf9llxjQnk3E8joN260aTD9Z752aR8nxLiJIoWXcdoa4xtp8AyW9WPCzHdZ5nep3SMLvq",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBm100o4xJepL_M16LnC7KZxOZ_R8WKl2Wt2cpEblZ8I87-yG4lCuUv6EFGKRpBVEkhQnfRdilBQS4AGbSeyccRLwHPoKk-eae3JgA1DcbbEaXvaPiLWo5aMggzgam-wO_y-prBxOq61ESUT9BRdLdR8A93815TE0OoeYezHYHduXHO_n0wI-5vbuhkPlRz-95gRM2jZjIdelhmzTq_zWAnvEloHH-GazTE0wcREpEqbOD-lpX52rbrCCsP9eqYUnzKb_wRVxETaTJ1",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBC0dlFQLZUAs9yBFQUoPpV-KZr6q0uQeFjKY_yZegCLLwK4LCXIHPHLmj9JwBSF-92_93b2UmK8xuPcZydfpy2-aBkEjiZwXkFVbJsgyu6UrIkP_z4iWyHToSYy8glfdMh4PavRiksycJUa1TElEg8zFr0ioe6TFaEe37r-5Hp1emHGHe5rKs6JYTwSM2FBX1o446qxwnZCBZS1NRA7Lxmx3k4C00agUZ-Q5KLc8ReHDNaYa8IC2CN1MmkLC8iz_-zO8tQpc7KrBOI",
] as const;

const DEFAULT_PROMPT_HISTORY = [
  {
    id: "prompt-default-1",
    prompt: "Minimal neon tiger line-art illustration for black premium t-shirt print",
    stylePreset: "Cyberpunk",
    colors: ["#895af6", "#22d3ee"],
    createdAtIso: "2026-02-15T09:22:00.000Z",
  },
  {
    id: "prompt-default-2",
    prompt: "Vintage japanese wave emblem with distressed ink texture for hoodie front",
    stylePreset: "Vintage",
    colors: ["#f59e0b", "#0ea5e9"],
    createdAtIso: "2026-02-11T13:08:00.000Z",
  },
  {
    id: "prompt-default-3",
    prompt: "Minimal geometric sunrise badge icon set for lifestyle streetwear collection",
    stylePreset: "Minimalist",
    colors: ["#34d399", "#895af6"],
    createdAtIso: "2026-02-08T17:40:00.000Z",
  },
] satisfies GeneratorPromptHistoryItem[];

const FREE_MONTHLY_CREDITS = 50;

type Tx = Prisma.TransactionClient;

class GeneratorServiceError extends Error {
  code: GeneratorErrorCode;

  constructor(code: GeneratorErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

function hashString(input: string): number {
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function normalizeStylePreset(input: string): StylePreset {
  return STYLE_PRESETS.find((preset) => preset.toLowerCase() === input.toLowerCase()) ?? "Cyberpunk";
}

function buildDesignTitle(prompt: string): string {
  const compactPrompt = prompt.replace(/\s+/g, " ").trim();
  const excerpt = compactPrompt.slice(0, 44);

  return excerpt.length === compactPrompt.length ? excerpt : `${excerpt}...`;
}

function buildMockResults(input: GenerateDesignInput): GeneratedVariation[] {
  const seed = hashString(
    `${input.prompt}:${input.stylePreset}:${input.colors.join(",")}:${input.referenceImageUrl ?? ""}`,
  );

  return Array.from({ length: input.variationCount }, (_, index) => {
    const imageIndex = (seed + index * 13) % MOCK_GENERATION_IMAGES.length;

    return {
      id: `${seed}-${index + 1}`,
      imageUrl: MOCK_GENERATION_IMAGES[imageIndex] ?? MOCK_GENERATION_IMAGES[0],
      status: "completed",
    };
  });
}

function validateInput(input: GenerateDesignInput): string | null {
  if (!input.prompt || input.prompt.trim().length < 8) {
    return "Prompt must be at least 8 characters.";
  }

  if (!Array.isArray(input.colors) || input.colors.length === 0) {
    return "Pick at least one color for better results.";
  }

  if (input.variationCount < 1 || input.variationCount > 8) {
    return "Variation count must be between 1 and 8.";
  }

  return null;
}

function normalizeInput(input: GenerateDesignInput): GenerateDesignInput {
  const uniqueColors = Array.from(new Set(input.colors.map((color) => color.trim()).filter(Boolean)));

  return {
    ...input,
    prompt: input.prompt.trim(),
    stylePreset: normalizeStylePreset(input.stylePreset),
    colors: uniqueColors.slice(0, 6),
    referenceImageUrl: input.referenceImageUrl?.trim() || undefined,
    variationCount: Math.max(1, Math.min(8, input.variationCount)),
  };
}

function toPlanLabel(plan: PlanTier): GeneratorWorkspaceOverview["planLabel"] {
  if (plan === PlanTier.BUSINESS) {
    return "Business";
  }

  if (plan === PlanTier.PRO) {
    return "Pro";
  }

  return "Free";
}

function toJsonObject(value: Prisma.JsonValue | null | undefined): Prisma.JsonObject {
  if (!value || Array.isArray(value) || typeof value !== "object") {
    return {};
  }

  return value as Prisma.JsonObject;
}

function extractColorPalette(value: Prisma.JsonValue | null | undefined): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item): item is string => item.length > 0)
    .slice(0, 6);
}

function buildTransformedImageUrl(imageUrl: string, transform: "upscale" | "remove_bg"): string {
  const token = Date.now().toString(36);

  try {
    const url = new URL(imageUrl);
    url.searchParams.set("mf_transform", transform);
    url.searchParams.set("mf_v", token);
    return url.toString();
  } catch {
    const separator = imageUrl.includes("?") ? "&" : "?";
    return `${imageUrl}${separator}mf_transform=${transform}&mf_v=${token}`;
  }
}

function buildProductDescription(prompt: string, stylePreset: string | null): string {
  const style = stylePreset?.trim() ? `${stylePreset} aesthetic` : "AI-crafted aesthetic";
  const trimmedPrompt = prompt.replace(/\s+/g, " ").trim();
  const excerpt = trimmedPrompt.slice(0, 120);

  return `Limited drop from MerchForge AI. ${style}. ${excerpt}${excerpt.length === trimmedPrompt.length ? "" : "..."}`;
}

function slugify(input: string): string {
  const normalized = input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 46);

  return normalized.length > 0 ? normalized : "ai-design";
}

async function getOrCreateSubscriptionTx(tx: Tx, userId: string) {
  const existing = await tx.subscription.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      monthlyCredits: true,
      usageCreditsRemaining: true,
      plan: true,
    },
  });

  if (existing) {
    return existing;
  }

  return tx.subscription.create({
    data: {
      userId,
      plan: PlanTier.FREE,
      status: SubscriptionStatus.ACTIVE,
      monthlyCredits: FREE_MONTHLY_CREDITS,
      usageCreditsRemaining: FREE_MONTHLY_CREDITS,
    },
    select: {
      id: true,
      monthlyCredits: true,
      usageCreditsRemaining: true,
      plan: true,
    },
  });
}

async function consumeCreditsTx(tx: Tx, userId: string, cost: number) {
  const subscription = await getOrCreateSubscriptionTx(tx, userId);

  if (cost <= 0) {
    return {
      subscriptionId: subscription.id,
      balanceAfter: subscription.usageCreditsRemaining,
      plan: subscription.plan,
      monthlyCredits: subscription.monthlyCredits,
    };
  }

  if (subscription.usageCreditsRemaining < cost) {
    throw new GeneratorServiceError(
      "INSUFFICIENT_CREDITS",
      `Not enough credits. You need ${cost} credit${cost === 1 ? "" : "s"}, but only ${subscription.usageCreditsRemaining} remain.`,
    );
  }

  const balanceAfter = subscription.usageCreditsRemaining - cost;

  await tx.subscription.update({
    where: { id: subscription.id },
    data: {
      usageCreditsRemaining: balanceAfter,
    },
  });

  return {
    subscriptionId: subscription.id,
    balanceAfter,
    plan: subscription.plan,
    monthlyCredits: subscription.monthlyCredits,
  };
}

async function createCreditUsageTx(
  tx: Tx,
  input: {
    userId: string;
    generationId?: string;
    type: CreditUsageType;
    cost: number;
    balanceAfter: number;
    description: string;
    metadata?: Prisma.InputJsonValue;
  },
) {
  if (input.cost <= 0) {
    return;
  }

  await tx.creditUsage.create({
    data: {
      userId: input.userId,
      generationId: input.generationId,
      type: input.type,
      delta: -input.cost,
      balanceAfter: input.balanceAfter,
      description: input.description,
      metadata: input.metadata,
    },
  });
}

function buildCanvasState(imageUrl: string): Prisma.InputJsonValue {
  return {
    version: 1,
    width: 2000,
    height: 2400,
    background: "#0f172a",
    layers: [
      {
        id: "design-layer",
        type: "image",
        src: imageUrl,
        x: 0.5,
        y: 0.46,
        scale: 0.62,
        rotation: 0,
      },
    ],
  } as Prisma.InputJsonValue;
}

function buildNextDesignMetadata(
  currentMetadata: Prisma.JsonValue | null,
  input: {
    action: GeneratorActionType;
    sourceGenerationId: string;
    sourceVariationId: string;
    sourceImageUrl: string;
    outputImageUrl: string;
  },
): Prisma.InputJsonValue {
  const base = toJsonObject(currentMetadata);
  const existingHistory = Array.isArray(base.transformHistory) ? base.transformHistory : [];

  const nextEntry = {
    action: input.action,
    sourceGenerationId: input.sourceGenerationId,
    sourceVariationId: input.sourceVariationId,
    sourceImageUrl: input.sourceImageUrl,
    outputImageUrl: input.outputImageUrl,
    createdAtIso: new Date().toISOString(),
  };

  return {
    ...base,
    lastAction: input.action,
    lastOutputImageUrl: input.outputImageUrl,
    transformHistory: [...existingHistory, nextEntry].slice(-20),
  } as Prisma.InputJsonValue;
}

async function getUniqueProductSlugTx(tx: Tx, ownerId: string, title: string): Promise<string> {
  const base = slugify(title);

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const suffix = attempt === 0 ? "" : `-${attempt + 1}`;
    const candidate = `${base}${suffix}`;

    const existing = await tx.storeProduct.findFirst({
      where: {
        ownerId,
        slug: candidate,
      },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }
  }

  return `${base}-${Date.now().toString().slice(-5)}`;
}

function validateVariationActionInput(input: GeneratorVariationActionInput): string | null {
  if (!input.designId?.trim()) {
    return "Missing design reference for this action.";
  }

  if (!input.generationId?.trim()) {
    return "Missing generation reference for this action.";
  }

  if (!input.variationId?.trim()) {
    return "Missing variation reference for this action.";
  }

  if (!input.imageUrl?.trim()) {
    return "Missing image URL for this action.";
  }

  return null;
}

export async function getGeneratorWorkspaceOverview(userId: string): Promise<GeneratorWorkspaceOverview> {
  const prisma = getPrismaClient();

  const [subscription, promptSource] = await Promise.all([
    prisma.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        usageCreditsRemaining: true,
        monthlyCredits: true,
        plan: true,
      },
    }),
    prisma.design.findMany({
      where: {
        userId,
        prompt: {
          not: "",
        },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        prompt: true,
        stylePreset: true,
        colorPalette: true,
        createdAt: true,
      },
    }),
  ]);

  const promptHistory = promptSource.map((item) => ({
    id: item.id,
    prompt: item.prompt,
    stylePreset: normalizeStylePreset(item.stylePreset ?? "Cyberpunk"),
    colors: extractColorPalette(item.colorPalette),
    createdAtIso: item.createdAt.toISOString(),
  }));

  return {
    creditsRemaining: subscription?.usageCreditsRemaining ?? FREE_MONTHLY_CREDITS,
    monthlyCredits: subscription?.monthlyCredits ?? FREE_MONTHLY_CREDITS,
    planLabel: toPlanLabel(subscription?.plan ?? PlanTier.FREE),
    promptHistory: promptHistory.length > 0 ? promptHistory : DEFAULT_PROMPT_HISTORY,
  };
}

export async function generateDesignForUser(
  userId: string,
  input: GenerateDesignInput,
): Promise<GenerateDesignResult> {
  const validationError = validateInput(input);

  if (validationError) {
    return {
      ok: false,
      code: "VALIDATION",
      error: validationError,
    };
  }

  const prisma = getPrismaClient();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    return {
      ok: false,
      code: "UNAUTHORIZED",
      error: "Unable to verify your session. Please sign in again.",
    };
  }

  const normalizedInput = normalizeInput(input);
  const results = buildMockResults(normalizedInput);

  try {
    const transaction = await prisma.$transaction(async (tx) => {
      const credits = await consumeCreditsTx(tx, user.id, normalizedInput.variationCount);

      const design = await tx.design.create({
        data: {
          userId: user.id,
          title: buildDesignTitle(normalizedInput.prompt),
          prompt: normalizedInput.prompt,
          stylePreset: normalizedInput.stylePreset,
          colorPalette: normalizedInput.colors,
          referenceImageUrl: normalizedInput.referenceImageUrl,
          primaryImageUrl: results[0]?.imageUrl,
          thumbnailUrl: results[0]?.imageUrl,
          status: DesignStatus.GENERATED,
          metadata: {
            source: "generator_mock_service",
            variationCount: normalizedInput.variationCount,
          },
        },
      });

      const generation = await tx.generation.create({
        data: {
          userId: user.id,
          designId: design.id,
          provider: AiProvider.OPENAI,
          model: "mock-model-v1",
          prompt: normalizedInput.prompt,
          referenceImageUrl: normalizedInput.referenceImageUrl,
          colorPalette: normalizedInput.colors,
          variationCount: normalizedInput.variationCount,
          status: GenerationStatus.COMPLETED,
          progress: 100,
          outputUrls: results.map((result) => result.imageUrl),
          costCredits: normalizedInput.variationCount,
          completedAt: new Date(),
          metadata: {
            mock: true,
            stylePreset: normalizedInput.stylePreset,
          },
        },
      });

      await createCreditUsageTx(tx, {
        userId: user.id,
        generationId: generation.id,
        type: CreditUsageType.GENERATION,
        cost: normalizedInput.variationCount,
        balanceAfter: credits.balanceAfter,
        description: `Generated ${normalizedInput.variationCount} variation${normalizedInput.variationCount === 1 ? "" : "s"}`,
        metadata: {
          stylePreset: normalizedInput.stylePreset,
        },
      });

      return {
        designId: design.id,
        generationId: generation.id,
        creditsRemaining: credits.balanceAfter,
      };
    });

    return {
      ok: true,
      designId: transaction.designId,
      generationId: transaction.generationId,
      results,
      creditsRemaining: transaction.creditsRemaining,
    };
  } catch (error) {
    if (error instanceof GeneratorServiceError) {
      return {
        ok: false,
        code: error.code,
        error: error.message,
      };
    }

    console.error("generateDesignForUser failed", error);

    return {
      ok: false,
      code: "SERVER_ERROR",
      error: "Unable to generate right now. Please try again.",
    };
  }
}

export async function runVariationActionForUser(
  userId: string,
  input: GeneratorVariationActionInput,
): Promise<GeneratorVariationActionResult> {
  const validationError = validateVariationActionInput(input);

  if (validationError) {
    return {
      ok: false,
      code: "VALIDATION",
      error: validationError,
    };
  }

  const prisma = getPrismaClient();

  const [design, generation] = await Promise.all([
    prisma.design.findFirst({
      where: {
        id: input.designId,
        userId,
      },
      select: {
        id: true,
        title: true,
        prompt: true,
        stylePreset: true,
        colorPalette: true,
        referenceImageUrl: true,
        metadata: true,
      },
    }),
    prisma.generation.findFirst({
      where: {
        id: input.generationId,
        userId,
      },
      select: {
        id: true,
      },
    }),
  ]);

  if (!design || !generation) {
    return {
      ok: false,
      code: "NOT_FOUND",
      error: "The selected generation could not be found anymore.",
    };
  }

  try {
    if (input.action === "SAVE") {
      const colorPalette = (design.colorPalette ?? undefined) as Prisma.InputJsonValue | undefined;

      const savedDesign = await prisma.design.create({
        data: {
          userId,
          title: `${design.title} (Saved)`,
          prompt: design.prompt,
          stylePreset: design.stylePreset,
          colorPalette,
          referenceImageUrl: design.referenceImageUrl,
          primaryImageUrl: input.imageUrl,
          thumbnailUrl: input.imageUrl,
          status: DesignStatus.DRAFT,
          metadata: {
            source: "generator_save_action",
            sourceDesignId: design.id,
            sourceGenerationId: generation.id,
            sourceVariationId: input.variationId,
          },
        },
        select: {
          id: true,
        },
      });

      return {
        ok: true,
        action: input.action,
        message: "Design saved to your library.",
        designId: savedDesign.id,
        redirectPath: "/dashboard/designs",
      };
    }

    if (input.action === "CREATE_MOCKUP") {
      const mockup = await prisma.mockup.create({
        data: {
          userId,
          designId: design.id,
          name: `${design.title} Mockup`,
          garmentType: GarmentType.T_SHIRT,
          garmentColor: "Black",
          canvasState: buildCanvasState(input.imageUrl),
          previewUrl: input.imageUrl,
          printReadyUrl: input.imageUrl,
          status: MockupStatus.READY,
          metadata: {
            sourceDesignId: design.id,
            sourceGenerationId: generation.id,
            sourceVariationId: input.variationId,
          },
        },
        select: {
          id: true,
        },
      });

      return {
        ok: true,
        action: input.action,
        message: "Mockup created successfully.",
        mockupId: mockup.id,
        redirectPath: `/dashboard/mockups/${mockup.id}`,
      };
    }

    if (input.action === "CREATE_PRODUCT") {
      const product = await prisma.$transaction(async (tx) => {
        const slug = await getUniqueProductSlugTx(tx, userId, design.title);

        return tx.storeProduct.create({
          data: {
            ownerId: userId,
            designId: design.id,
            slug,
            title: design.title,
            description: buildProductDescription(design.prompt, design.stylePreset),
            priceCents: 3900,
            status: ProductStatus.DRAFT,
            podProvider: PodProvider.NONE,
            images: [input.imageUrl],
            metadata: {
              sourceDesignId: design.id,
              sourceGenerationId: generation.id,
              sourceVariationId: input.variationId,
            },
          },
          select: {
            id: true,
          },
        });
      });

      return {
        ok: true,
        action: input.action,
        message: "Draft product created in your storefront.",
        productId: product.id,
        redirectPath: "/dashboard/storefront",
      };
    }

    const transform = input.action === "UPSCALE" ? "upscale" : "remove_bg";
    const transformedImageUrl = buildTransformedImageUrl(input.imageUrl, transform);
    const cost = input.action === "UPSCALE" ? 2 : 1;

    const transformed = await prisma.$transaction(async (tx) => {
      const credits = await consumeCreditsTx(tx, userId, cost);

      const transformGeneration = await tx.generation.create({
        data: {
          userId,
          designId: design.id,
          provider: AiProvider.OPENAI,
          model: input.action === "UPSCALE" ? "mock-upscale-v1" : "mock-remove-bg-v1",
          prompt: design.prompt,
          referenceImageUrl: input.imageUrl,
          colorPalette: design.colorPalette ?? Prisma.JsonNull,
          variationCount: 1,
          status: GenerationStatus.COMPLETED,
          progress: 100,
          outputUrls: [transformedImageUrl],
          costCredits: cost,
          completedAt: new Date(),
          metadata: {
            sourceGenerationId: generation.id,
            sourceVariationId: input.variationId,
            action: input.action,
          },
        },
        select: {
          id: true,
        },
      });

      await tx.design.update({
        where: { id: design.id },
        data: {
          primaryImageUrl: transformedImageUrl,
          thumbnailUrl: transformedImageUrl,
          version: {
            increment: 1,
          },
          status: DesignStatus.GENERATED,
          metadata: buildNextDesignMetadata(design.metadata, {
            action: input.action,
            sourceGenerationId: generation.id,
            sourceVariationId: input.variationId,
            sourceImageUrl: input.imageUrl,
            outputImageUrl: transformedImageUrl,
          }),
        },
      });

      await createCreditUsageTx(tx, {
        userId,
        generationId: transformGeneration.id,
        type: input.action === "UPSCALE" ? CreditUsageType.UPSCALE : CreditUsageType.REMOVE_BACKGROUND,
        cost,
        balanceAfter: credits.balanceAfter,
        description:
          input.action === "UPSCALE"
            ? "Upscaled design variation"
            : "Removed background from design variation",
        metadata: {
          sourceGenerationId: generation.id,
          sourceVariationId: input.variationId,
          sourceImageUrl: input.imageUrl,
        },
      });

      return {
        generationId: transformGeneration.id,
        creditsRemaining: credits.balanceAfter,
      };
    });

    return {
      ok: true,
      action: input.action,
      message:
        input.action === "UPSCALE"
          ? "Upscale complete. Design version updated."
          : "Background removed and version updated.",
      imageUrl: transformedImageUrl,
      designId: design.id,
      creditsRemaining: transformed.creditsRemaining,
    };
  } catch (error) {
    if (error instanceof GeneratorServiceError) {
      return {
        ok: false,
        code: error.code,
        error: error.message,
      };
    }

    console.error("runVariationActionForUser failed", error);

    return {
      ok: false,
      code: "SERVER_ERROR",
      error: "Unable to complete this action right now.",
    };
  }
}
