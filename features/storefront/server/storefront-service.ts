import { ProductStatus } from "@prisma/client";

import { getPrismaClient } from "@/server/db/prisma";

export type StorefrontOverview = {
  username: string;
  publicStorePath: string;
  creatorName: string;
  creatorBio: string;
  avatarUrl: string | null;
  heroImageUrl: string;
  primaryColor: string;
  followersLabel: string;
  itemsCount: number;
  products: Array<{
    id: string;
    title: string;
    description: string;
    priceCents: number;
    imageUrl: string;
    soldOut: boolean;
    isPopular: boolean;
  }>;
  reviews: Array<{
    id: string;
    authorName: string;
    productTitle: string;
    comment: string;
    avatarUrl: string | null;
  }>;
  isDemoData: boolean;
};

const FALLBACK_PRODUCTS: StorefrontOverview["products"] = [
  {
    id: "product-demo-1",
    title: "Neural Mesh Hoodie",
    description: "Heavyweight organic cotton, algorithmic pattern embroidery.",
    priceCents: 7800,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCVMXEyDv_fkUySVxONCOGWA_j1U8SZru2BOGimqw48CzvLJAtUy_HyiCcMHuWAqsizBYqjz3sgGdimm8Pz335dKpCDSQzTM-33MAhqPGJRY3uP62kIaOHRXa2oHw6j0p-hPsfefV2osmuNqy2G_e4fX0vstTFP04273cvlYbq2y0svym5cnfJCfph9_Nxo7kIWt1TlR2cqJfW1Ntriwi_4NomFpefen94-kXyusmuAb1wv7En5AqwMXau37h32CnZ1AlqdJU0MAsHu",
    soldOut: false,
    isPopular: false,
  },
  {
    id: "product-demo-2",
    title: "Digital Mirage Tee",
    description: "Vibrant sublimation print, premium relaxed fit.",
    priceCents: 4200,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDUHyHV16rd-VctP4PF19R1RJWflQQKbP9zBdmRuL4N9Pr3HGDznFn6quIvUIDkSmAh5EvM2isBhmwdy4Lal6QIRxRiZBTJvH1jN30mD4-L8USba-fX7YpbgHIUEshsUHI6imGVYM2STEuyWU2iPiPdlE_ZxU-HE2sk1NHQd2zgn0i-QEtAp963f8JU8AmU3b3wQqyrStwEycoJga2VX24c_AC0kPOxJ6hE3XRWVB0coNd_zYENk6D0mPsuuFVSsBrUcKaUBoaBPKAv",
    soldOut: false,
    isPopular: true,
  },
  {
    id: "product-demo-3",
    title: "Fragment Denim Jacket",
    description: "Custom distressed finish with generative geometry patches.",
    priceCents: 12400,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC9Z1C99BTmSRoUBhXCp5zVeWuKypgLT3c3Ss75mSMmEAUmhUTHRi3zwJJHqy9LEaK5dmwR_RBtGaQokYBEoZ2MXZYh47zf_vObie4hQPJb6WrMv2tl1so4qZAlE5G5qN7I4Zd6pB6433dlLTlsNgxkEhyfa19gW9VL6OhioJqD1DOn9BQvC77dBc8dwRN9QC5SwT-Fd06qspfUJ6XmvlTXWZCKqPzlaAuqZrGzBS5L6Jb0sLyvhT5IkqLd_JFcowgRvXEpg4n1BO0w",
    soldOut: false,
    isPopular: false,
  },
  {
    id: "product-demo-4",
    title: "Void Cycle Longsleeve",
    description: "Sleeve printed design, luxury heavyweight jersey.",
    priceCents: 5500,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAK2k26CvrXTMkzPzkHwOzl5hs13VYoVxWmN4cH1HJ-GkecK4hOLBIdc_C_pJf_yWcbXNG710UsuL28nKUIEUNyyL6rf-1VLDALH14TIW4sKV62yAabu0OGWg8Utewh1dIviJmmmUeZbabjRDsOWcFGWJ36ik3GfKtm2JsgsDCWC3BmU1n1_SEAwEetn2pb8wVIr5osfqhW1fOGjq7Tl-zbIa8WeI5kKZ5M6dLWYOHM3JJgo1bjBemkJvzwLrdHJIbeVtGAPlV5PeOo",
    soldOut: true,
    isPopular: false,
  },
];

const FALLBACK_REVIEWS: StorefrontOverview["reviews"] = [
  {
    id: "review-demo-1",
    authorName: "Sarah Jenkins",
    productTitle: "Neural Mesh Hoodie",
    comment:
      "The quality of the embroidery is insane. You can really see the complexity of the AI design translated into physical thread.",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAb6rxUnBhY1pMWhugfy-92IJgk6DhPnCKPUOnTxVwfOStL0SLTf2wVO_tfckVnteICT89SLYUmJ948l1v2BjGcx2NmrNmnLZuJnsu_aJ_xN6Ie-b1oyOmVUm2hX6fD78OyGROQXtDWiG_jxO9Yja1NhiSKZzqbza-uIjx9g2E2Of_fyrcnnKs7EtBiiy3eFOdtLezlopAOfdQMs-SOq-VhTFyZDe17Uti4zyurVxd4lBaOWJGvjfjZsKPmdXXHsWuPzWn8Yx_byR87",
  },
  {
    id: "review-demo-2",
    authorName: "Marcus Thorne",
    productTitle: "Digital Mirage Tee",
    comment:
      "The print colors are so vibrant. It looks exactly like the mockup, maybe even better in person.",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBXEN446fTfwzO3Yz2CvZtX0FtgBRw89SrD15rq8hEEGa9Rgs_7bwttNRVqZIO0u3bruI6l00we882921VcCrQXK2J_c4Rx2XLQA3CkGelm2bfMhLkxaImxIy1KuecID-ccsQIjvkvBSo74stIBVADsCjZH3FUNgy5mfU5zMOQ1hwOQ5Vwidrx7LxRMBNlVl1Dgurv6VLeaFxlWYbkzfOlsOQvztFpEE2saqGx8iGFpFhvDfUwkhVS1ioIsrLNBiZycGUFUuldXNPt-",
  },
  {
    id: "review-demo-3",
    authorName: "Elena Rodriguez",
    productTitle: "Fragment Denim Jacket",
    comment:
      "A true statement piece. Every time I wear this jacket someone asks where I got it.",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD4E5hGkYbZvqjhrOwWyjDugGfir1G-j-u00n8BKPi5RZGSZIk89nWALqIlKDHgYkXefzwYkpJBawedyiIyt7YRIyfSYCy2MFGQVBo50_DO4WabroFX9jzPUYU3FzGqVW9UN_9E-DVhKmYqhZdu39w88kVUBja-JdImbKdU9ov42BAMYyN0eQ69xVyQ_PtnGBKlU2t4jhwSv5TkwIP0_hfNisC8QaJoFD68w6tBAZMcsnQqEC10nGcNgSFMQ_G57ZGArIwS3ZRxsl01",
  },
];

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

async function buildStorefrontOverviewByUser(userId: string): Promise<StorefrontOverview | null> {
  const prisma = getPrismaClient();

  const [user, products, reviews] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        fullName: true,
        username: true,
        bio: true,
        avatarUrl: true,
        brandKits: {
          orderBy: { createdAt: "asc" },
          take: 1,
          select: {
            logoUrl: true,
            primaryColor: true,
          },
        },
      },
    }),
    prisma.storeProduct.findMany({
      where: {
        ownerId: userId,
        status: {
          in: [ProductStatus.ACTIVE, ProductStatus.DRAFT],
        },
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: 8,
      select: {
        id: true,
        title: true,
        description: true,
        priceCents: true,
        images: true,
        status: true,
        isFeatured: true,
      },
    }),
    prisma.review.findMany({
      where: {
        sellerId: userId,
      },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        comment: true,
        author: {
          select: {
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
        storeProduct: {
          select: {
            title: true,
          },
        },
      },
    }),
  ]);

  const mappedProducts = products
    .map((product) => {
      const imageUrl = firstImageFromJson(product.images);
      if (!imageUrl) {
        return null;
      }

      return {
        id: product.id,
        title: product.title,
        description: product.description ?? "Premium AI-crafted design.",
        priceCents: product.priceCents,
        imageUrl,
        soldOut: product.status !== ProductStatus.ACTIVE,
        isPopular: product.isFeatured,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const mappedReviews = reviews.map((review) => ({
    id: review.id,
    authorName: review.author.fullName?.trim() || review.author.email || "Verified buyer",
    productTitle: review.storeProduct?.title ?? "Store product",
    comment: review.comment?.trim() || "Great quality and exactly as shown in the preview.",
    avatarUrl: review.author.avatarUrl,
  }));

  if (!user) {
    return null;
  }

  const username = user.username || "creator";
  const creatorName = user.fullName?.trim() || username;
  const creatorBio =
    user.bio?.trim() ||
    "Official merch store with premium AI-generated apparel and digital design drops.";

  return {
    username,
    publicStorePath: `/store/${username}`,
    creatorName,
    creatorBio,
    avatarUrl: user.avatarUrl ?? null,
    heroImageUrl:
      user.brandKits[0]?.logoUrl ??
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA3tvsaz82Y4S2NERdl3GqX82uMagmGChplefdFv0TK_M8tXU9LNV5XLg0hH7Gyb5orzswsS9WsTXIqY6E4a3WprnVvKROu_npiYbqHEHqBbIuh1IiE83_BNJaPYtNsn4ivQDNK-313BI8VkzWFKx7HU_Dw5b5lIHCRESCG7bgw985mhNIs4HgSN0ZAGmIgoHCIDAkESt7IblWHRTUbSKAQNoLeZyGYguOoFXC6PES54AOXFTH7idzmpnXdt8WyX9sem_Gp7FE1a-0k",
    primaryColor: user.brandKits[0]?.primaryColor ?? "#895af6",
    followersLabel: "15.2k Followers",
    itemsCount: mappedProducts.length > 0 ? mappedProducts.length : FALLBACK_PRODUCTS.length,
    products: mappedProducts.length > 0 ? mappedProducts : FALLBACK_PRODUCTS,
    reviews: mappedReviews.length > 0 ? mappedReviews : FALLBACK_REVIEWS,
    isDemoData: mappedProducts.length === 0,
  };
}

export async function getStorefrontOverview(userId: string): Promise<StorefrontOverview> {
  const overview = await buildStorefrontOverviewByUser(userId);

  if (overview) {
    return overview;
  }

  return {
    username: "creator",
    publicStorePath: "/store/creator",
    creatorName: "Creator",
    creatorBio: "Official merch store with premium AI-generated apparel and digital design drops.",
    avatarUrl: null,
    heroImageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA3tvsaz82Y4S2NERdl3GqX82uMagmGChplefdFv0TK_M8tXU9LNV5XLg0hH7Gyb5orzswsS9WsTXIqY6E4a3WprnVvKROu_npiYbqHEHqBbIuh1IiE83_BNJaPYtNsn4ivQDNK-313BI8VkzWFKx7HU_Dw5b5lIHCRESCG7bgw985mhNIs4HgSN0ZAGmIgoHCIDAkESt7IblWHRTUbSKAQNoLeZyGYguOoFXC6PES54AOXFTH7idzmpnXdt8WyX9sem_Gp7FE1a-0k",
    primaryColor: "#895af6",
    followersLabel: "15.2k Followers",
    itemsCount: FALLBACK_PRODUCTS.length,
    products: FALLBACK_PRODUCTS,
    reviews: FALLBACK_REVIEWS,
    isDemoData: true,
  };
}

export async function getPublicStorefrontOverviewByUsername(
  username: string,
): Promise<StorefrontOverview | null> {
  const prisma = getPrismaClient();

  const [user, products, reviews] = await Promise.all([
    prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        fullName: true,
        bio: true,
        avatarUrl: true,
        brandKits: {
          orderBy: { createdAt: "asc" },
          take: 1,
          select: {
            logoUrl: true,
            primaryColor: true,
          },
        },
      },
    }),
    prisma.storeProduct.findMany({
      where: {
        owner: {
          username,
        },
        status: ProductStatus.ACTIVE,
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: 20,
      select: {
        id: true,
        title: true,
        description: true,
        priceCents: true,
        images: true,
        isFeatured: true,
      },
    }),
    prisma.review.findMany({
      where: {
        seller: {
          username,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        comment: true,
        author: {
          select: {
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
        storeProduct: {
          select: {
            title: true,
          },
        },
      },
    }),
  ]);

  if (!user) {
    return null;
  }

  const mappedProducts = products
    .map((product) => {
      const imageUrl = firstImageFromJson(product.images);
      if (!imageUrl) {
        return null;
      }

      return {
        id: product.id,
        title: product.title,
        description: product.description ?? "Premium AI-crafted design.",
        priceCents: product.priceCents,
        imageUrl,
        soldOut: false,
        isPopular: product.isFeatured,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const mappedReviews = reviews.map((review) => ({
    id: review.id,
    authorName: review.author.fullName?.trim() || review.author.email || "Verified buyer",
    productTitle: review.storeProduct?.title ?? "Store product",
    comment: review.comment?.trim() || "Great quality and exactly as shown in the preview.",
    avatarUrl: review.author.avatarUrl,
  }));

  return {
    username: user.username,
    publicStorePath: `/store/${user.username}`,
    creatorName: user.fullName?.trim() || user.username,
    creatorBio:
      user.bio?.trim() ||
      "Official merch store with premium AI-generated apparel and digital design drops.",
    avatarUrl: user.avatarUrl,
    heroImageUrl:
      user.brandKits[0]?.logoUrl ??
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA3tvsaz82Y4S2NERdl3GqX82uMagmGChplefdFv0TK_M8tXU9LNV5XLg0hH7Gyb5orzswsS9WsTXIqY6E4a3WprnVvKROu_npiYbqHEHqBbIuh1IiE83_BNJaPYtNsn4ivQDNK-313BI8VkzWFKx7HU_Dw5b5lIHCRESCG7bgw985mhNIs4HgSN0ZAGmIgoHCIDAkESt7IblWHRTUbSKAQNoLeZyGYguOoFXC6PES54AOXFTH7idzmpnXdt8WyX9sem_Gp7FE1a-0k",
    primaryColor: user.brandKits[0]?.primaryColor ?? "#895af6",
    followersLabel: "Public Store",
    itemsCount: mappedProducts.length,
    products: mappedProducts,
    reviews: mappedReviews,
    isDemoData: false,
  };
}
