import { TemplateStatus } from "@prisma/client";

import { getPrismaClient } from "@/server/db/prisma";

export type TemplateCategory =
  | "T-Shirts"
  | "Hoodies"
  | "Sweatshirts"
  | "Tote Bags"
  | "Accessories";

export type TemplateMarketplaceOverview = {
  templates: Array<{
    id: string;
    title: string;
    description: string;
    priceCents: number;
    creatorName: string;
    creatorAvatarUrl: string | null;
    likesCount: number;
    downloadsCount: number;
    tag: string;
    styleLabel: string;
    category: TemplateCategory;
    imageUrl: string;
    createdAtIso: string;
    isPurchasedByViewer: boolean;
    isOwnedByViewer: boolean;
  }>;
  isDemoData: boolean;
};

const FALLBACK_TEMPLATES: TemplateMarketplaceOverview["templates"] = [
  {
    id: "tpl-demo-1",
    title: "Neon Samurai V3",
    description: "High-contrast cyberpunk art pack optimized for DTG printing.",
    priceCents: 1499,
    creatorName: "AIGenius",
    creatorAvatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBR8TqnULDWj2HZjZ_uI8zp0xlo3z5-EPLllOG8bziaPgMlBIAwfxWRA886nORcxx4MHwqJympOv7E5N7pyLtbGOuJ4fHAm7n-ACRVEkb9gLhw8b4Junkj9x7l0kbSQTIAVrkIUwM4Jwa2QgmPKhT81TUOXspMOPPUIFDae0sZQHjqCxP0DLOSEHL-CALeunAbWJYVnHBNRS8hwOd95NoH4QndMGQZ3iQlf8Dmpi3qUWI1xFpxGqj5CFdXBHgmdwuvwmv9aBEZ9c6Py",
    likesCount: 1200,
    downloadsCount: 320,
    tag: "Cyberpunk",
    styleLabel: "Cyberpunk",
    category: "Hoodies",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBr5CXemqvcBTAOq8KEK-20fZWHyXOJr8E8pFNg2adRVj0DGZK0WtuwnW1NkI354d74CfHlUSE7eurlmDFAKvcN-HF6j8tG7wOxGX9gW4ym39iwUUf5ckbC83nNHio72J8KItN4tHPv7Eqm31mMvKknJW9k6CWqi-XFcKqqqYeBTKmeo-XroaydmtuIHxsH6utcliNjZ_skuMnm3njO4kGRdewVnhmWq6nFabDZ6Hi3aARy4UJSrzD5lkzAID7CrGiZkAHlG50ex8T9",
    createdAtIso: "2026-02-18T10:30:00.000Z",
    isPurchasedByViewer: false,
    isOwnedByViewer: false,
  },
  {
    id: "tpl-demo-2",
    title: "Fluid Dreamscape",
    description: "Abstract gradient wave composition for apparel and poster designs.",
    priceCents: 1250,
    creatorName: "PixelWiz",
    creatorAvatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBEFYJoZWTUkhScTKQ45zy5p8xmGgXm-TPv4YUN5qmAp0iefSH4-9E5l_a8u-0XvWLJ_HjVH1yIPr-DfOk9dGvPqa-6t9DXwmtWI15x-JRhHEjvBP4qllVErfWSgmE2nx-W2sVSwI5afV2_JEahGcOjnFFd0MhR_ckMN02l6eoUvOCL9_QocsmrrAi568tdLBvx-sRbjpxoQGymwSFbiKxSbSw_zR39U7mWPuWKaZ5tTjRDUXpaH4n80nbjNudOUo38Y3IbAvAq7pTL",
    likesCount: 842,
    downloadsCount: 244,
    tag: "Abstract",
    styleLabel: "Abstract",
    category: "T-Shirts",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAG5pzO_oukCxTDkyvuGH6ra126nPsjJvsvUPwI067tAYLBMZBBH9ChrLNpXbDp0M6qGOObJUHWRv8Fq_dQL4y9IJk6lr-54350qb-t7DGw65WKlcwC3CLENb-andQTNOMBQLmws5SAm8YIYEBx5pO-n24mp00R3bIJZThzDuNnjPsP622bWIldytjdjxrsUfO-NYJahlO3n9v2pLjat7iZoV7v222brAhxnbC1kPiWAkGoBzI7S2W0aNCm_2MLlOHPpGXuJ9-8NJTN",
    createdAtIso: "2026-02-12T13:45:00.000Z",
    isPurchasedByViewer: false,
    isOwnedByViewer: false,
  },
  {
    id: "tpl-demo-3",
    title: "Void Geometry Pack",
    description: "Minimal linework elements and badges for modern lifestyle brands.",
    priceCents: 999,
    creatorName: "SynthLab",
    creatorAvatarUrl: null,
    likesCount: 503,
    downloadsCount: 167,
    tag: "Minimalist",
    styleLabel: "Minimalist",
    category: "Sweatshirts",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAC955hEiy4cGXekut9EakQMUIiSSe-7DAsuq4BRFtJ64j8UzojMWzgGIpX6djAwOn5-HEX0RAD9Jro8VXqj77PAWoer7GbPQP7lkMEuIH8yCNE8wpm8OOza1OxR1EVwH3sJm7NaKf39dAZrv2bbcX6JbD4JklMwaZVAyf4uDs7ftPCImAHNNgFyKN8J3cfwRabg2nahIvqf9llxjQnk3E8joN260aTD9Z752aR8nxLiJIoWXcdoa4xtp8AyW9WPCzHdZ5nep3SMLvq",
    createdAtIso: "2026-02-02T08:15:00.000Z",
    isPurchasedByViewer: false,
    isOwnedByViewer: false,
  },
];

function resolveTag(tags: unknown): string {
  if (Array.isArray(tags)) {
    const firstTag = tags.find((item) => typeof item === "string");
    if (typeof firstTag === "string" && firstTag.trim().length > 0) {
      return firstTag.trim();
    }
  }

  if (tags && typeof tags === "object" && "primary" in tags) {
    const primary = (tags as { primary?: unknown }).primary;
    if (typeof primary === "string" && primary.trim().length > 0) {
      return primary.trim();
    }
  }

  return "Premium";
}

function resolveCategory(text: string): TemplateCategory {
  const normalized = text.toLowerCase();

  if (normalized.includes("hoodie")) {
    return "Hoodies";
  }

  if (normalized.includes("sweatshirt")) {
    return "Sweatshirts";
  }

  if (normalized.includes("tote") || normalized.includes("bag")) {
    return "Tote Bags";
  }

  if (normalized.includes("hat") || normalized.includes("cap") || normalized.includes("mug")) {
    return "Accessories";
  }

  return "T-Shirts";
}

export async function getTemplateMarketplaceOverview(
  viewerUserId?: string,
): Promise<TemplateMarketplaceOverview> {
  const prisma = getPrismaClient();
  const templates = await prisma.template.findMany({
    where: {
      status: TemplateStatus.PUBLISHED,
    },
    orderBy: [{ isFeatured: "desc" }, { downloadsCount: "desc" }, { createdAt: "desc" }],
    take: 16,
    select: {
      id: true,
      title: true,
      description: true,
      priceCents: true,
      thumbnailUrl: true,
      tags: true,
      downloadsCount: true,
      createdAt: true,
      creatorId: true,
      creator: {
        select: {
          fullName: true,
          username: true,
          avatarUrl: true,
        },
      },
      purchases: viewerUserId
        ? {
            where: { buyerId: viewerUserId },
            take: 1,
            select: { id: true },
          }
        : false,
    },
  });

  const mapped = templates
    .filter((template) => Boolean(template.thumbnailUrl))
    .map((template) => {
      const tag = resolveTag(template.tags);
      const styleLabel = tag;
      const fullText = `${template.title} ${template.description ?? ""} ${tag}`;

      return {
        id: template.id,
        title: template.title,
        description: template.description?.trim() || "Premium AI template ready for apparel production.",
        priceCents: template.priceCents,
        creatorName: template.creator.fullName?.trim() || template.creator.username,
        creatorAvatarUrl: template.creator.avatarUrl,
        likesCount: Math.max(template.downloadsCount * 3, 24),
        downloadsCount: template.downloadsCount,
        tag,
        styleLabel,
        category: resolveCategory(fullText),
        imageUrl: template.thumbnailUrl as string,
        createdAtIso: template.createdAt.toISOString(),
        isPurchasedByViewer: Array.isArray(template.purchases) ? template.purchases.length > 0 : false,
        isOwnedByViewer: Boolean(viewerUserId) && template.creatorId === viewerUserId,
      };
    });

  return {
    templates: mapped.length > 0 ? mapped : FALLBACK_TEMPLATES,
    isDemoData: mapped.length === 0,
  };
}
