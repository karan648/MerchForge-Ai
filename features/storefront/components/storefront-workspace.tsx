"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

import { UserAvatar } from "@/components/ui/user-avatar";
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
      className="flex h-10 w-10 items-center justify-center rounded-full border border-[#895af6]/20 transition-all hover:bg-[#895af6] hover:text-white"
      target="_blank"
      rel="noreferrer"
      aria-label={icon}
    >
      <span className="material-symbols-outlined text-lg">{icon}</span>
    </Link>
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
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<StorefrontTab>("all");
  const [favoriteProductIds, setFavoriteProductIds] = useState<Record<string, boolean>>({});
  const [shareState, setShareState] = useState<"idle" | "copied" | "error">("idle");

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

  const visibleProducts = filteredProducts.slice(0, 12);

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

  return (
    <div className={cn("min-h-screen text-slate-900 dark:text-slate-100", isPublic ? "bg-[#f6f5f8] dark:bg-[#151022]" : "") }>
      {isPublic ? (
        <header className="glass-panel sticky top-0 z-40 border-b border-[#895af6]/10 px-4 py-4 sm:px-6">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4">
            <div className="flex items-center gap-6 md:gap-8">
              <div className="flex items-center gap-2 text-[#895af6]">
                <span className="material-symbols-outlined text-3xl">diamond</span>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  MerchForge <span className="text-[#895af6]">AI</span>
                </h1>
              </div>

              <nav className="hidden items-center gap-6 md:flex">
                <button type="button" onClick={() => setActiveTab("all")} className="text-sm font-medium transition-colors hover:text-[#895af6]">
                  Shop All
                </button>
                <button type="button" onClick={() => setActiveTab("new")} className="text-sm font-medium transition-colors hover:text-[#895af6]">
                  Collections
                </button>
                <button type="button" onClick={() => setActiveTab("art")} className="text-sm font-medium transition-colors hover:text-[#895af6]">
                  About
                </button>
              </nav>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative hidden sm:block">
                <span className="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-xl text-slate-400">search</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search designs..."
                  className="w-60 rounded-lg bg-slate-200/60 py-2 pr-3 pl-10 text-sm outline-none ring-0 transition-all focus:ring-2 focus:ring-[#895af6] dark:bg-[#895af6]/8"
                />
              </div>

              <button
                type="button"
                onClick={copyStoreUrl}
                className="relative rounded-lg p-2 transition-colors hover:bg-[#895af6]/10"
                aria-label="Share storefront"
              >
                <span className="material-symbols-outlined">shopping_bag</span>
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#895af6]" />
              </button>

              <span className="h-10 w-10 overflow-hidden rounded-full border-2 border-[#895af6]/20 bg-cover bg-center">
                <UserAvatar
                  fullName={overview.creatorName}
                  avatarUrl={overview.avatarUrl}
                  className="h-10 w-10"
                  fallbackClassName="text-xs"
                />
              </span>
            </div>
          </div>
        </header>
      ) : null}

      <main className={cn("mx-auto w-full px-4 pb-20 sm:px-6", isPublic ? "max-w-7xl" : "max-w-7xl pt-6 md:pt-8") }>
        {!isPublic ? (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-[#895af6]/10 dark:bg-[#151022]">
            <div>
              <h2 className="text-lg font-bold tracking-tight">Creator Storefront Preview</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Public URL: {overview.publicStorePath}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search products"
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-0 focus:border-[#895af6] focus:ring-2 focus:ring-[#895af6]/20 dark:border-[#895af6]/15 dark:bg-[#0f0f15]"
              />
              <Link
                href="/dashboard/store-builder"
                className="flex items-center gap-2 rounded-lg border border-[#895af6] bg-white px-4 py-2 text-sm font-semibold text-[#895af6] transition-colors hover:bg-[#895af6]/10 dark:bg-[#895af6]/10 dark:text-white dark:hover:bg-[#895af6]/20"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                Edit Store
              </Link>
              <Link
                href={overview.publicStorePath}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg bg-[#895af6] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#895af6]/90"
              >
                Open Public Store
              </Link>
            </div>
          </div>
        ) : null}

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="group relative mt-6 h-[320px] w-full overflow-hidden rounded-xl md:h-[400px]"
        >
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#151022] via-transparent to-transparent" />
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{
              backgroundImage: `url('${overview.heroImageUrl}')`,
            }}
          />

          <div className="absolute bottom-8 left-8 z-20 md:bottom-12 md:left-12">
            <span className="mb-4 inline-block rounded-full border border-[#895af6]/30 bg-[#895af6]/20 px-3 py-1 text-xs font-bold tracking-widest text-[#895af6] uppercase backdrop-blur-md">
              Limited Edition Release
            </span>
            <h2 className="mb-2 text-3xl font-extrabold text-white md:text-5xl">The {overview.creatorName} Collection</h2>
            <p className="max-w-xl text-sm text-slate-200 md:text-lg">
              AI-Designed. Human-Inspired. Discover premium creator drops, ready for instant checkout.
            </p>
          </div>
        </motion.section>

        <section className="relative z-30 -mt-12 mb-12 flex flex-col gap-6 px-2 md:-mt-16 md:flex-row md:items-end md:px-12">
          <div className="h-32 w-32 overflow-hidden rounded-xl border-4 border-[#151022] shadow-2xl">
            <UserAvatar
              fullName={overview.creatorName}
              avatarUrl={overview.avatarUrl}
              className="h-32 w-32"
              fallbackClassName="text-2xl"
            />
          </div>

          <div className="flex-1 pb-2">
            <div className="mb-1 flex items-center gap-2">
              <h3 className="text-2xl font-bold">{overview.creatorName}</h3>
              <span className="material-symbols-outlined text-xl text-[#895af6]" title="Verified Creator">
                verified
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">group</span> {overview.followersLabel}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">inventory_2</span> {overview.itemsCount} Items
              </span>
              <span className="flex items-center gap-1 text-[#895af6]">
                <span className="material-symbols-outlined text-sm">link</span> {overview.publicStorePath}
              </span>
            </div>
          </div>

          <div className="flex gap-3 pb-2">
            {isPublic ? (
              <Link
                href="/register"
                className="flex items-center gap-2 rounded-lg bg-[#895af6] px-6 py-2.5 font-semibold text-white transition-all hover:opacity-90"
              >
                <span className="material-symbols-outlined text-sm">person_add</span> Follow
              </Link>
            ) : (
              <Link
                href={overview.publicStorePath}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-lg bg-[#895af6] px-6 py-2.5 font-semibold text-white transition-all hover:opacity-90"
              >
                <span className="material-symbols-outlined text-sm">open_in_new</span> Visit Store
              </Link>
            )}
            <button
              type="button"
              onClick={copyStoreUrl}
              className="rounded-lg bg-slate-200 px-4 py-2.5 font-semibold text-slate-900 transition-all hover:bg-slate-300 dark:bg-[#895af6]/10 dark:text-slate-100"
            >
              <span className="material-symbols-outlined text-sm leading-none">share</span>
            </button>
          </div>
        </section>

        {shareState !== "idle" ? (
          <div className="mb-5 text-sm font-medium text-[#895af6]">
            {shareState === "copied" ? "Store URL copied to clipboard." : "Unable to copy URL on this browser."}
          </div>
        ) : null}

        <nav className="mb-10 flex items-center gap-8 overflow-x-auto border-b border-[#895af6]/10 pb-1 whitespace-nowrap">
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
                    ? "border-b-2 border-[#895af6] text-[#895af6]"
                    : "border-b-2 border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        <section className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleProducts.map((product, index) => {
            const isFavorite = Boolean(favoriteProductIds[product.id]);
            const actionHref = overview.isDemoData && !isPublic ? "/dashboard/generator" : `/checkout/${product.id}`;

            return (
              <motion.article
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.04 }}
                className="group flex flex-col overflow-hidden rounded-xl border border-[#895af6]/10 bg-slate-100/50 transition-all hover:border-[#895af6]/40 dark:bg-[#895af6]/5"
              >
                <div className="relative aspect-square overflow-hidden bg-slate-200 dark:bg-slate-800">
                  {product.isPopular ? (
                    <div className="absolute top-3 left-3 z-10">
                      <span className="rounded bg-[#895af6] px-2 py-1 text-[10px] font-bold text-white uppercase">Popular</span>
                    </div>
                  ) : null}

                  {product.soldOut ? (
                    <div className="absolute top-3 right-3 z-10">
                      <span className="rounded bg-slate-800 px-2 py-1 text-[10px] font-bold text-white uppercase">Sold Out</span>
                    </div>
                  ) : (
                    <div className="absolute top-3 right-3 z-10">
                      <button
                        type="button"
                        onClick={() => toggleFavorite(product.id)}
                        className="rounded-full bg-[#151022]/50 p-2 text-white backdrop-blur-md transition-colors hover:text-[#895af6]"
                        aria-label="Toggle favorite"
                      >
                        <span className="material-symbols-outlined text-lg">
                          {isFavorite ? "favorite" : "favorite_border"}
                        </span>
                      </button>
                    </div>
                  )}

                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className={cn(
                      "h-full w-full object-cover transition-transform duration-500 group-hover:scale-110",
                      product.soldOut ? "grayscale" : "",
                    )}
                  />
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-2 flex items-start justify-between">
                    <h4 className={cn("text-lg leading-tight font-bold transition-colors group-hover:text-[#895af6]", product.soldOut ? "text-slate-400" : "") }>
                      {product.title}
                    </h4>
                    <span className={cn("font-bold", product.soldOut ? "text-slate-500" : "text-[#895af6]") }>{formatCurrency(product.priceCents)}</span>
                  </div>
                  <p className="mb-6 text-xs text-slate-500">{product.description}</p>

                  {product.soldOut ? (
                    <button
                      type="button"
                      disabled
                      className="mt-auto w-full cursor-not-allowed rounded-lg bg-slate-700 py-3 font-bold text-slate-400"
                    >
                      Out of Stock
                    </button>
                  ) : (
                    <Link
                      href={actionHref}
                      className="mt-auto flex w-full items-center justify-center gap-2 rounded-lg bg-[#895af6] py-3 font-bold text-white transition-all hover:shadow-[0_0_20px_rgba(137,90,246,0.3)]"
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
          <div className="mt-10 rounded-xl border border-slate-200 bg-white px-4 py-10 text-center dark:border-[#895af6]/15 dark:bg-[#151022]">
            <h3 className="text-lg font-bold">No products match this filter</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Try another search query or category tab.</p>
          </div>
        ) : null}

        <section className="mt-24">
          <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h3 className="mb-2 text-3xl font-bold">Community Feedback</h3>
              <p className="text-slate-500">Real thoughts from humans who wear the future.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex text-[#895af6]">
                <span className="material-symbols-outlined">star</span>
                <span className="material-symbols-outlined">star</span>
                <span className="material-symbols-outlined">star</span>
                <span className="material-symbols-outlined">star</span>
                <span className="material-symbols-outlined">star_half</span>
              </div>
              <span className="text-lg font-bold">4.8 Average</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {overview.reviews.slice(0, 3).map((review) => (
              <article key={review.id} className="rounded-xl border border-[#895af6]/5 bg-slate-100 p-6 dark:bg-[#895af6]/5">
                <div className="mb-4 flex items-center gap-3">
                  <span className="h-10 w-10 overflow-hidden rounded-full border border-[#895af6]/20">
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
                <p className="text-sm leading-relaxed text-slate-600 italic dark:text-slate-300">&ldquo;{review.comment}&rdquo;</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      {isPublic ? (
        <footer className="border-t border-[#895af6]/10 bg-slate-100 py-12 dark:bg-[#895af6]/5">
          <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-8 px-4 md:flex-row md:px-6">
            <div className="flex flex-col items-center gap-4 md:items-start">
              <div className="flex items-center gap-2 text-[#895af6] opacity-80">
                <span className="material-symbols-outlined">diamond</span>
                <span className="font-bold tracking-tight">MerchForge AI</span>
              </div>
              <p className="text-center text-xs text-slate-500 md:text-left">
                © 2026 {overview.creatorName} Studio. All Rights Reserved.
              </p>
            </div>

            <div className="flex gap-12">
              <div className="flex flex-col gap-2">
                <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">Support</p>
                <Link href="/help" className="text-sm transition-colors hover:text-[#895af6]">Shipping Info</Link>
                <Link href="/help" className="text-sm transition-colors hover:text-[#895af6]">Returns</Link>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">Company</p>
                <Link href="/privacy" className="text-sm transition-colors hover:text-[#895af6]">Privacy Policy</Link>
                <Link href="/terms" className="text-sm transition-colors hover:text-[#895af6]">Terms of Service</Link>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {socialLink("public", "https://merchforge.ai")}
              {socialLink("alternate_email", "https://x.com")}
              {socialLink("play_circle", "https://youtube.com")}
            </div>
          </div>

          <div className="mx-auto mt-12 flex w-full max-w-7xl justify-center border-t border-[#895af6]/5 pt-8 px-4 md:px-6">
            <p className="text-[10px] tracking-[0.2em] text-slate-600 uppercase dark:text-slate-500">
              Powered by MerchForge AI Engine
            </p>
          </div>
        </footer>
      ) : null}
    </div>
  );
}
