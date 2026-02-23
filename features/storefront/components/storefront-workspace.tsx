"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo, useState, useTransition } from "react";

import { UserAvatar } from "@/components/ui/user-avatar";
import { toggleStoreFollowAction } from "@/features/storefront/server/storefront-actions";
import type { StorefrontOverview } from "@/features/storefront/server/storefront-service";
import { cn } from "@/lib/utils";

type StorefrontTab = "all" | "new" | "limited" | "apparel" | "art";

type ProductWithIndex = StorefrontOverview["products"][number] & {
  orderIndex: number;
};

const STOREFRONT_TABS: Array<{ key: StorefrontTab; label: string }> = [
  { key: "all", label: "All Products" },
  { key: "new", label: "New Arrivals" },
  { key: "limited", label: "Limited Drops" },
  { key: "apparel", label: "Hoodies & Tees" },
  { key: "art", label: "Digital Art" },
];

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

function formatFollowerLabel(followerCount: number): string {
  if (followerCount >= 1_000_000) {
    return `${(followerCount / 1_000_000).toFixed(1).replace(/\.0$/, "")}M Followers`;
  }

  if (followerCount >= 1_000) {
    return `${(followerCount / 1_000).toFixed(1).replace(/\.0$/, "")}k Followers`;
  }

  return `${followerCount} Follower${followerCount === 1 ? "" : "s"}`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = hex.trim().replace("#", "");

  if (normalized.length === 3) {
    const [r, g, b] = normalized.split("");
    return {
      r: Number.parseInt(`${r}${r}`, 16),
      g: Number.parseInt(`${g}${g}`, 16),
      b: Number.parseInt(`${b}${b}`, 16),
    };
  }

  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

function withAlpha(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function isDarkHex(hex: string): boolean {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance < 0.56;
}

function isApparelProduct(product: ProductWithIndex): boolean {
  const content = `${product.title} ${product.description}`.toLowerCase();
  return (
    content.includes("hoodie") ||
    content.includes("tee") ||
    content.includes("shirt") ||
    content.includes("jacket") ||
    content.includes("longsleeve") ||
    content.includes("sweatshirt")
  );
}

function matchesTab(product: ProductWithIndex, tab: StorefrontTab): boolean {
  if (tab === "all") {
    return true;
  }

  if (tab === "new") {
    return product.orderIndex <= 2;
  }

  if (tab === "limited") {
    return product.isPopular || product.soldOut;
  }

  if (tab === "apparel") {
    return isApparelProduct(product);
  }

  return !isApparelProduct(product);
}

function socialLink(icon: string, href: string) {
  return (
    <Link
      href={href}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300/70 bg-white/70 text-slate-700 transition-all hover:bg-slate-900 hover:text-white dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-slate-300 dark:hover:border-zinc-700"
      target="_blank"
      rel="noreferrer"
      aria-label={icon}
    >
      <span className="material-symbols-outlined text-lg">{icon}</span>
    </Link>
  );
}

function EmptyStorefrontState() {
  return (
    <div className="flex min-h-[56vh] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-16 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#895af6]/10">
        <span className="material-symbols-outlined text-4xl text-[#895af6]">storefront</span>
      </div>
      <h2 className="mb-3 text-2xl font-bold text-slate-900 dark:text-slate-100">No Storefront Yet</h2>
      <p className="mb-8 max-w-md text-sm text-slate-500 dark:text-slate-400">
        Create your storefront to publish products with your own branding, banner, and public profile.
      </p>
      <Link
        href="/dashboard/store-builder"
        className="inline-flex items-center gap-2 rounded-lg bg-[#895af6] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#895af6]/20 transition-all hover:brightness-110"
      >
        <span className="material-symbols-outlined text-lg">add</span>
        Create Your Storefront
      </Link>
    </div>
  );
}

export function StorefrontWorkspace({
  overview,
  mode = "dashboard",
}: {
  overview: StorefrontOverview;
  mode?: "dashboard" | "public";
}) {
  const isPublic = mode === "public";
  const accentColor = overview.primaryColor || "#895af6";
  const accentForeground = isDarkHex(accentColor) ? "#ffffff" : "#0f172a";
  const accentBorder = withAlpha(accentColor, 0.55);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<StorefrontTab>("all");
  const [favoriteProductIds, setFavoriteProductIds] = useState<Record<string, boolean>>({});
  const [shareState, setShareState] = useState<"idle" | "copied" | "error">("idle");
  const [followMessage, setFollowMessage] = useState<string | null>(null);
  const [followerCount, setFollowerCount] = useState(overview.followerCount);
  const [isFollowing, setIsFollowing] = useState(overview.viewerIsFollowing);
  const [isFollowPending, startFollowTransition] = useTransition();

  const hasStorefront = overview.hasStorefront;

  const productsWithIndex = useMemo<ProductWithIndex[]>(
    () => overview.products.map((product, index) => ({ ...product, orderIndex: index })),
    [overview.products],
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return productsWithIndex.filter((product) => {
      if (!matchesTab(product, activeTab)) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return `${product.title} ${product.description}`.toLowerCase().includes(normalizedQuery);
    });
  }, [activeTab, productsWithIndex, searchQuery]);

  const visibleProducts = filteredProducts.slice(0, 16);
  const followersLabel = formatFollowerLabel(followerCount);

  function toggleFavorite(productId: string) {
    setFavoriteProductIds((current) => ({
      ...current,
      [productId]: !current[productId],
    }));
  }

  async function copyStoreUrl() {
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const url = `${origin}${overview.publicStorePath}`;
      await navigator.clipboard.writeText(url);
      setShareState("copied");
      window.setTimeout(() => setShareState("idle"), 1500);
    } catch {
      setShareState("error");
      window.setTimeout(() => setShareState("idle"), 1800);
    }
  }

  function handleFollowCreator() {
    if (!isPublic) {
      return;
    }

    setFollowMessage(null);

    startFollowTransition(async () => {
      const result = await toggleStoreFollowAction(overview.creatorId);

      if (!result.ok) {
        setFollowMessage(result.error);
        return;
      }

      setIsFollowing(result.isFollowing);
      setFollowerCount(result.followerCount);
      setFollowMessage(result.isFollowing ? "You are now following this creator." : "You unfollowed this creator.");
    });
  }

  if (!isPublic && !hasStorefront) {
    return (
      <div className="min-h-screen bg-[#f6f5f8] px-3 pb-20 pt-4 dark:bg-[#101015] md:px-6 md:pt-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/70">
          <div>
            <h2 className="text-lg font-bold tracking-tight">Creator Storefront</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Set up your custom storefront to start selling</p>
          </div>
        </div>
        <EmptyStorefrontState />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f5f8] text-slate-900 dark:bg-[#101015] dark:text-slate-100">
      {isPublic ? (
        <>
          <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-[#f6f5f8]/85 px-4 py-3 backdrop-blur-md dark:border-zinc-800 dark:bg-[#101015]/85 md:hidden">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl" style={{ color: accentColor, fontVariationSettings: "'FILL' 1" }}>
                bolt
              </span>
              <h2 className="text-lg font-bold tracking-tight">MerchForge AI</h2>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={copyStoreUrl}
                className="flex size-10 items-center justify-center rounded-full bg-slate-200 text-slate-700 dark:bg-zinc-900 dark:text-slate-300"
              >
                <span className="material-symbols-outlined text-[22px]">share</span>
              </button>
              <button
                type="button"
                className="flex size-10 items-center justify-center rounded-full bg-slate-200 text-slate-700 dark:bg-zinc-900 dark:text-slate-300"
              >
                <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
              </button>
            </div>
          </header>

          <header className="sticky top-0 z-40 hidden items-center justify-between border-b border-slate-200 bg-[#f6f5f8]/85 px-6 py-4 backdrop-blur-md dark:border-zinc-800 dark:bg-[#101015]/85 md:flex">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-3xl" style={{ color: accentColor }}>
                diamond
              </span>
              <h1 className="text-2xl font-bold tracking-tight">{overview.creatorName} Store</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={copyStoreUrl}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-slate-200 dark:hover:bg-zinc-800"
              >
                Share
              </button>
              <Link
                href="/register"
                className="rounded-lg border px-4 py-2 text-sm font-semibold shadow-sm transition hover:brightness-105"
                style={{ backgroundColor: accentColor, color: accentForeground, borderColor: accentBorder }}
              >
                Start Selling
              </Link>
            </div>
          </header>
        </>
      ) : null}

      <main className="w-full px-3 pb-24 pt-3 md:px-5 md:pt-5 lg:px-6">
        {!isPublic ? (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/70">
            <div>
              <h2 className="text-lg font-bold tracking-tight">Creator Storefront Preview</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Public URL: {overview.publicStorePath}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search products"
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-0 focus:border-[#895af6] focus:ring-2 focus:ring-[#895af6]/20 dark:border-zinc-800 dark:bg-zinc-900"
              />
              <Link
                href="/dashboard/store-builder"
                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-slate-100 dark:hover:bg-zinc-800"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                Edit Store
              </Link>
              <Link
                href={overview.publicStorePath}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border px-4 py-2 text-sm font-semibold shadow-sm transition hover:brightness-105"
                style={{ backgroundColor: accentColor, color: accentForeground, borderColor: accentBorder }}
              >
                Open Public Store
              </Link>
            </div>
          </div>
        ) : null}

        <section className="relative h-56 w-full overflow-hidden rounded-2xl md:h-[430px]">
          <img
            src={overview.heroImageUrl}
            alt={`${overview.creatorName} banner`}
            className="h-full w-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(145deg, ${withAlpha(accentColor, 0.45)} 0%, rgba(15, 15, 18, 0.84) 78%)`,
            }}
          />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0f0f12]/85 to-transparent" />

          <div className="absolute inset-0 flex items-end p-5 pb-12 md:p-10 md:pb-16">
            <div className="max-w-3xl text-center md:text-left">
              <span
                className="mb-3 inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white"
                style={{ backgroundColor: withAlpha(accentColor, 0.7) }}
              >
                Limited Edition Release
              </span>
              <h1 className="text-3xl font-black text-white md:text-6xl">The {overview.creatorName} Collection</h1>
              <p className="mt-2 text-sm text-slate-200 md:max-w-2xl md:text-xl">
                AI-Designed. Human-Inspired. Discover premium creator drops, ready for instant checkout.
              </p>
            </div>
          </div>
        </section>

        <section className="relative z-20 mt-4 mb-8 rounded-2xl border border-slate-200 bg-[#f6f5f8]/95 p-4 shadow-lg backdrop-blur-md dark:border-zinc-800 dark:bg-[#101015]/95 md:p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col items-center gap-3 text-center md:flex-row md:items-end md:gap-5 md:text-left">
              <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-[#f6f5f8] shadow-xl dark:border-[#101015] md:h-28 md:w-28">
                <UserAvatar
                  fullName={overview.creatorName}
                  avatarUrl={overview.avatarUrl}
                  className="h-24 w-24 md:h-28 md:w-28"
                  fallbackClassName="text-2xl"
                />
              </div>

              <div>
                <div className="mb-1 flex items-center justify-center gap-2 md:justify-start">
                  <h2 className="text-3xl font-black leading-none">{overview.creatorName}</h2>
                  <span className="material-symbols-outlined" style={{ color: accentColor }}>
                    verified
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">@{overview.username}</p>
                <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">{overview.creatorBio}</p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500 dark:text-slate-400 md:justify-start">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">group</span>
                    {followersLabel}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">inventory_2</span>
                    {overview.itemsCount} Items
                  </span>
                  <span className="flex items-center gap-1" style={{ color: accentColor }}>
                    <span className="material-symbols-outlined text-sm">link</span>
                    {overview.publicStorePath}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 md:justify-end">
              {isPublic ? (
                <button
                  type="button"
                  onClick={handleFollowCreator}
                  disabled={isFollowPending}
                  className="rounded-xl border px-6 py-2.5 text-sm font-bold shadow-sm transition-opacity hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ backgroundColor: accentColor, color: accentForeground, borderColor: accentBorder }}
                >
                  {isFollowPending ? "Updating..." : isFollowing ? "Following" : "Follow"}
                </button>
              ) : (
                <Link
                  href="/dashboard/store-builder"
                  className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-bold text-slate-800 transition-colors hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-slate-100 dark:hover:bg-zinc-800"
                >
                  Edit Store
                </Link>
              )}

              <Link
                href={overview.publicStorePath}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-xl border px-6 py-2.5 text-sm font-bold shadow-sm transition hover:brightness-105"
                style={{ backgroundColor: accentColor, color: accentForeground, borderColor: accentBorder }}
              >
                <span className="material-symbols-outlined text-sm">open_in_new</span>
                Visit Store
              </Link>
              <button
                type="button"
                onClick={copyStoreUrl}
                className="rounded-xl bg-slate-200 p-3 text-slate-900 transition hover:bg-slate-300 dark:bg-zinc-900 dark:text-slate-100 dark:hover:bg-zinc-800"
              >
                <span className="material-symbols-outlined text-lg">share</span>
              </button>
            </div>
          </div>

          {followMessage ? (
            <p className="mt-4 text-sm font-medium" style={{ color: accentColor }}>
              {followMessage}
            </p>
          ) : null}

          {shareState !== "idle" ? (
            <p className="mt-2 text-sm font-medium" style={{ color: accentColor }}>
              {shareState === "copied" ? "Store URL copied to clipboard." : "Unable to copy URL on this browser."}
            </p>
          ) : null}
        </section>

        <nav className="mb-6 flex items-center gap-6 overflow-x-auto border-b border-slate-300/60 pb-1 whitespace-nowrap dark:border-zinc-800">
          {STOREFRONT_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "pb-4 text-sm font-semibold transition-colors",
                  isActive
                    ? "border-b-2"
                    : "border-b-2 border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200",
                )}
                style={isActive ? { borderColor: accentColor, color: accentColor } : undefined}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
          {visibleProducts.map((product, index) => {
            const isFavorite = Boolean(favoriteProductIds[product.id]);
            const actionHref = overview.isDemoData && !isPublic ? "/dashboard/generator" : `/checkout/${product.id}`;

            return (
              <motion.article
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: index * 0.03 }}
                className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/70"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-slate-100 dark:bg-zinc-800">
                  {product.isPopular ? (
                    <div className="absolute left-2 top-2 z-10">
                      <span className="rounded px-2 py-1 text-[10px] font-bold uppercase text-white" style={{ backgroundColor: accentColor }}>
                        Popular
                      </span>
                    </div>
                  ) : null}

                  {product.soldOut ? (
                    <div className="absolute right-2 top-2 z-10">
                      <span className="rounded bg-slate-800 px-2 py-1 text-[10px] font-bold uppercase text-white">Sold Out</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleFavorite(product.id)}
                      className="absolute right-2 top-2 z-10 rounded-full bg-[#101015]/60 p-1.5 text-white backdrop-blur"
                    >
                      <span className="material-symbols-outlined text-base">{isFavorite ? "favorite" : "favorite_border"}</span>
                    </button>
                  )}

                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className={cn("h-full w-full object-cover transition-transform duration-500 group-hover:scale-105", product.soldOut ? "grayscale" : "")}
                  />
                </div>

                <div className="flex flex-1 flex-col p-3.5">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <h3 className={cn("line-clamp-1 text-sm font-bold md:text-base", product.soldOut ? "text-slate-500" : "")}>{product.title}</h3>
                    <span className="text-sm font-black" style={{ color: accentColor }}>
                      {formatCurrency(product.priceCents)}
                    </span>
                  </div>
                  <p className="mb-4 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{product.description}</p>

                  {product.soldOut ? (
                    <button
                      type="button"
                      disabled
                      className="mt-auto w-full cursor-not-allowed rounded-lg bg-slate-200 py-2.5 text-xs font-bold text-slate-500 dark:bg-zinc-800 dark:text-slate-500"
                    >
                      Out of Stock
                    </button>
                  ) : (
                    <Link
                      href={actionHref}
                      className="mt-auto flex w-full items-center justify-center gap-1 rounded-lg py-2.5 text-xs font-bold text-white"
                      style={{ backgroundColor: accentColor }}
                    >
                      {overview.isDemoData && !isPublic ? "Create Similar" : "Buy Now"}
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                  )}
                </div>
              </motion.article>
            );
          })}
        </section>

        {visibleProducts.length === 0 ? (
          <div className="mt-8 rounded-xl border border-slate-200 bg-white px-4 py-10 text-center dark:border-zinc-800 dark:bg-zinc-900/70">
            <h3 className="text-lg font-bold">No products match this filter</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Try another search query or category tab.</p>
          </div>
        ) : null}

        <section className="mt-14">
          <div className="mb-6 flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
            <div>
              <h3 className="text-2xl font-black md:text-3xl">Customer Reviews</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Real thoughts from customers buying creator drops.</p>
            </div>
            <div className="flex items-center gap-2 text-[#f59e0b]">
              <span className="material-symbols-outlined">star</span>
              <span className="material-symbols-outlined">star</span>
              <span className="material-symbols-outlined">star</span>
              <span className="material-symbols-outlined">star</span>
              <span className="material-symbols-outlined">star_half</span>
            </div>
          </div>

          <div className="-mx-3 flex gap-3 overflow-x-auto px-3 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0">
            {overview.reviews.slice(0, 3).map((review) => (
              <article
                key={review.id}
                className="min-w-[280px] rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70 md:min-w-0"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="h-10 w-10 overflow-hidden rounded-full border border-slate-300 dark:border-zinc-700">
                    <UserAvatar
                      fullName={review.authorName}
                      avatarUrl={review.avatarUrl}
                      className="h-10 w-10"
                      fallbackClassName="text-[10px]"
                    />
                  </span>
                  <div>
                    <p className="text-sm font-bold">{review.authorName}</p>
                    <p className="text-xs text-slate-500">Purchased: {review.productTitle}</p>
                  </div>
                </div>
                <p className="text-sm italic text-slate-600 dark:text-slate-300">&ldquo;{review.comment}&rdquo;</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      {isPublic ? (
        <>
          <footer className="mt-14 border-t border-slate-200 bg-white/70 px-4 py-10 dark:border-zinc-800 dark:bg-zinc-900/40 md:px-6">
            <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
              <div className="text-center md:text-left">
                <p className="mb-2 text-sm font-semibold text-slate-600 dark:text-slate-300">Secure checkout powered by Stripe</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">© 2026 {overview.creatorName}. All rights reserved.</p>
              </div>

              <div className="flex gap-8 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                <Link href="/help" className="hover:text-slate-800 dark:hover:text-slate-200">Shipping</Link>
                <Link href="/help" className="hover:text-slate-800 dark:hover:text-slate-200">Returns</Link>
                <Link href="/privacy" className="hover:text-slate-800 dark:hover:text-slate-200">Privacy</Link>
              </div>

              <div className="flex items-center gap-3">
                {socialLink("public", "https://merchforge.ai")}
                {socialLink("alternate_email", "https://x.com")}
                {socialLink("play_circle", "https://youtube.com")}
              </div>
            </div>
          </footer>

          <nav className="fixed bottom-5 left-1/2 z-[100] flex h-16 w-[92%] max-w-md -translate-x-1/2 items-center justify-around rounded-full border border-slate-200 bg-white/95 px-5 shadow-2xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/95 md:hidden">
            <button type="button" className="flex flex-col items-center gap-1" style={{ color: accentColor }}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                storefront
              </span>
              <span className="text-[10px] font-bold">Shop</span>
            </button>
            <button type="button" className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500">
              <span className="material-symbols-outlined">explore</span>
              <span className="text-[10px] font-bold">Explore</span>
            </button>
            <div className="-mt-10 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg" style={{ backgroundColor: accentColor }}>
              <span className="material-symbols-outlined text-3xl">add</span>
            </div>
            <button type="button" className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500">
              <span className="material-symbols-outlined">chat_bubble</span>
              <span className="text-[10px] font-bold">Contact</span>
            </button>
            <button type="button" className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500">
              <span className="material-symbols-outlined">person</span>
              <span className="text-[10px] font-bold">Profile</span>
            </button>
          </nav>
        </>
      ) : null}
    </div>
  );
}
