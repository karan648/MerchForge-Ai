"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { Reveal } from "@/components/ui/reveal";
import { UserAvatar } from "@/components/ui/user-avatar";
import { purchaseTemplateAction } from "@/features/templates/server/template-marketplace-actions";
import type {
  TemplateCategory,
  TemplateMarketplaceOverview,
} from "@/features/templates/server/template-marketplace-service";
import { cn } from "@/lib/utils";

type FeedFilter = "featured" | "trending" | "new";
type SortOption = "popularity" | "downloads" | "price_low" | "price_high" | "newest";

const CATEGORY_OPTIONS: TemplateCategory[] = ["T-Shirts", "Hoodies", "Sweatshirts", "Tote Bags"];
const STYLE_OPTIONS = ["Cyberpunk", "Minimalist", "Retro", "Abstract", "Vaporwave"] as const;
const SORT_OPTIONS: Array<{ key: SortOption; label: string }> = [
  { key: "popularity", label: "Popularity" },
  { key: "downloads", label: "Downloads" },
  { key: "price_low", label: "Price: Low to High" },
  { key: "price_high", label: "Price: High to Low" },
  { key: "newest", label: "Newest" },
];

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

function toDate(value: string): Date {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) {
    return new Date(0);
  }

  return parsed;
}

export function TemplateMarketplaceWorkspace({
  overview,
}: {
  overview: TemplateMarketplaceOverview;
}) {
  const router = useRouter();

  const [feedFilter, setFeedFilter] = useState<FeedFilter>("featured");
  const [styleFilter, setStyleFilter] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>("popularity");
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [quickViewTemplateId, setQuickViewTemplateId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [ownedTemplates, setOwnedTemplates] = useState<Record<string, boolean>>(() => {
    const entries = overview.templates.map((template) => [
      template.id,
      template.isPurchasedByViewer || template.isOwnedByViewer,
    ]);

    return Object.fromEntries(entries);
  });

  const [categoryFilter, setCategoryFilter] = useState<Record<TemplateCategory, boolean>>({
    "T-Shirts": true,
    Hoodies: true,
    Sweatshirts: true,
    "Tote Bags": true,
    Accessories: true,
  });

  const [isPurchasing, startPurchasing] = useTransition();

  const templates = useMemo(() => {
    let items = [...overview.templates];

    if (feedFilter === "trending") {
      items.sort((a, b) => b.likesCount + b.downloadsCount - (a.likesCount + a.downloadsCount));
    }

    if (feedFilter === "new") {
      items.sort((a, b) => toDate(b.createdAtIso).valueOf() - toDate(a.createdAtIso).valueOf());
    }

    const enabledCategories = Object.entries(categoryFilter)
      .filter(([, enabled]) => enabled)
      .map(([category]) => category as TemplateCategory);

    items = items.filter((template) => {
      if (enabledCategories.length > 0 && !enabledCategories.includes(template.category)) {
        return false;
      }

      if (styleFilter && template.styleLabel.toLowerCase() !== styleFilter.toLowerCase()) {
        return false;
      }

      return true;
    });

    if (sortOption === "popularity") {
      items.sort((a, b) => b.likesCount - a.likesCount);
    }

    if (sortOption === "downloads") {
      items.sort((a, b) => b.downloadsCount - a.downloadsCount);
    }

    if (sortOption === "price_low") {
      items.sort((a, b) => a.priceCents - b.priceCents);
    }

    if (sortOption === "price_high") {
      items.sort((a, b) => b.priceCents - a.priceCents);
    }

    if (sortOption === "newest") {
      items.sort((a, b) => toDate(b.createdAtIso).valueOf() - toDate(a.createdAtIso).valueOf());
    }

    return items;
  }, [categoryFilter, feedFilter, overview.templates, sortOption, styleFilter]);

  const activeTemplate = useMemo(
    () => templates.find((template) => template.id === quickViewTemplateId) ?? null,
    [quickViewTemplateId, templates],
  );

  function toggleCategory(category: TemplateCategory) {
    setCategoryFilter((current) => ({
      ...current,
      [category]: !current[category],
    }));
  }

  function clearAllFilters() {
    setCategoryFilter({
      "T-Shirts": true,
      Hoodies: true,
      Sweatshirts: true,
      "Tote Bags": true,
      Accessories: true,
    });
    setStyleFilter(null);
    setFeedFilter("featured");
    setSortOption("popularity");
    setNotice({ tone: "success", message: "Filters cleared." });
  }

  function openQuickView(templateId: string) {
    setQuickViewTemplateId(templateId);
  }

  function closeQuickView() {
    setQuickViewTemplateId(null);
  }

  function openTemplateInGenerator(templateId: string) {
    router.push(`/dashboard/generator?template=${encodeURIComponent(templateId)}`);
  }

  function copyTemplateLink(templateId: string) {
    const origin = window.location.origin;
    const shareUrl = `${origin}/dashboard/templates?template=${encodeURIComponent(templateId)}`;

    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        setNotice({ tone: "success", message: "Template link copied to clipboard." });
      })
      .catch(() => {
        setNotice({ tone: "error", message: "Unable to copy template link." });
      });
  }

  function purchaseTemplate(templateId: string) {
    startPurchasing(async () => {
      const result = await purchaseTemplateAction(templateId);

      if (!result.ok) {
        setNotice({ tone: "error", message: result.error });
        return;
      }

      setOwnedTemplates((current) => ({
        ...current,
        [templateId]: true,
      }));

      setNotice({
        tone: "success",
        message: result.message,
      });
      router.refresh();
    });
  }

  return (
    <div className="mx-auto w-full max-w-7xl p-4 md:p-8">
      {notice ? (
        <div
          className={cn(
            "mb-4 rounded-lg border px-3 py-2 text-sm",
            notice.tone === "success"
              ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
              : "border-red-500/25 bg-red-500/10 text-red-300",
          )}
        >
          {notice.message}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <Reveal className="h-fit rounded-2xl border border-slate-200 bg-white p-4 dark:border-[#895af6]/10 dark:bg-[#1a1a1e]">
          <div className="space-y-6">
            <div className="space-y-1">
              <p className="text-[10px] font-bold tracking-[0.14em] text-slate-500 uppercase dark:text-slate-400">
                Marketplace
              </p>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Filters</h2>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setFeedFilter("featured")}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                  feedFilter === "featured"
                    ? "bg-[#895af6]/10 text-[#895af6]"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-[#895af6]/10",
                )}
              >
                <span className="material-symbols-outlined text-base">explore</span>
                Featured
              </button>
              <button
                type="button"
                onClick={() => setFeedFilter("trending")}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                  feedFilter === "trending"
                    ? "bg-[#895af6]/10 text-[#895af6]"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-[#895af6]/10",
                )}
              >
                <span className="material-symbols-outlined text-base">trending_up</span>
                Trending
              </button>
              <button
                type="button"
                onClick={() => setFeedFilter("new")}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                  feedFilter === "new"
                    ? "bg-[#895af6]/10 text-[#895af6]"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-[#895af6]/10",
                )}
              >
                <span className="material-symbols-outlined text-base">new_releases</span>
                New Arrivals
              </button>
            </div>

            <div>
              <p className="mb-3 text-[10px] font-bold tracking-[0.14em] text-slate-500 uppercase dark:text-slate-400">
                Category
              </p>
              <div className="space-y-2">
                {CATEGORY_OPTIONS.map((category) => (
                  <label key={category} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={categoryFilter[category]}
                      onChange={() => toggleCategory(category)}
                      className="rounded border-slate-300 text-[#895af6] focus:ring-[#895af6]/50 dark:border-[#895af6]/30 dark:bg-[#0f0f12]"
                    />
                    {category}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-[10px] font-bold tracking-[0.14em] text-slate-500 uppercase dark:text-slate-400">
                Style
              </p>
              <div className="flex flex-wrap gap-2">
                {STYLE_OPTIONS.map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setStyleFilter((current) => (current === style ? null : style))}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      styleFilter === style
                        ? "border-[#895af6]/40 bg-[#895af6]/10 text-[#895af6]"
                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 dark:border-[#895af6]/20 dark:bg-[#0f0f12] dark:text-slate-300",
                    )}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={clearAllFilters}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-[#895af6]/20 dark:bg-[#0f0f12] dark:text-slate-300"
            >
              Clear All Filters
            </button>
          </div>
        </Reveal>

        <div className="space-y-6">
          <Reveal className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-[#895af6]/10 dark:bg-[#1a1a1e]">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                  Featured Templates
                </h1>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Discover AI-curated apparel designs ready for your brand.
                </p>
              </div>
              <div className="flex items-center gap-3">
                {overview.isDemoData ? (
                  <span className="rounded-full border border-[#895af6]/25 bg-[#895af6]/10 px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-[#895af6] uppercase">
                    Demo Data
                  </span>
                ) : null}

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsSortMenuOpen((current) => !current)}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-[#895af6]/20 dark:bg-[#0f0f12] dark:text-slate-300"
                  >
                    {SORT_OPTIONS.find((option) => option.key === sortOption)?.label ?? "Popularity"}
                    <span className="material-symbols-outlined text-sm">expand_more</span>
                  </button>

                  {isSortMenuOpen ? (
                    <div className="absolute top-[calc(100%+6px)] right-0 z-20 min-w-[180px] rounded-lg border border-slate-200 bg-white p-1 shadow-lg dark:border-[#895af6]/20 dark:bg-[#0f0f15]">
                      {SORT_OPTIONS.map((option) => (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() => {
                            setSortOption(option.key);
                            setIsSortMenuOpen(false);
                          }}
                          className={cn(
                            "flex w-full items-center rounded-md px-2.5 py-2 text-left text-xs font-medium transition-colors",
                            option.key === sortOption
                              ? "bg-[#895af6]/10 text-[#895af6]"
                              : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-[#895af6]/10",
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </Reveal>

          {templates.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-[#895af6]/10 dark:bg-[#1a1a1e]">
              <h3 className="text-lg font-bold">No templates match your filters</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Try changing category, style, or sorting to see more results.
              </p>
            </div>
          ) : (
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {templates.map((template, index) => {
                const isOwned = ownedTemplates[template.id] || template.isOwnedByViewer;

                return (
                  <Reveal
                    key={template.id}
                    delayMs={index * 40}
                    className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-[#895af6]/10 dark:bg-[#1a1a1e]"
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={template.imageUrl}
                        alt={template.title}
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <span className="absolute top-3 left-3 rounded-md bg-[#895af6] px-2 py-1 text-[10px] font-bold tracking-[0.08em] text-white uppercase shadow-lg">
                        {template.tag}
                      </span>
                      <div className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => openQuickView(template.id)}
                          className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-slate-900"
                        >
                          Quick View
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-base font-bold text-slate-900 transition-colors group-hover:text-[#895af6] dark:text-slate-100">
                          {template.title}
                        </h3>
                        <p className="text-sm font-bold text-[#895af6]">{formatCurrency(template.priceCents)}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="size-6 overflow-hidden rounded-full border border-[#895af6]/25">
                            <UserAvatar
                              fullName={template.creatorName}
                              avatarUrl={template.creatorAvatarUrl}
                              fallbackClassName="text-[9px]"
                            />
                          </span>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{template.creatorName}</p>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="inline-flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] text-red-500">favorite</span>
                            {template.likesCount.toLocaleString("en-US")}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">download</span>
                            {template.downloadsCount.toLocaleString("en-US")}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          isOwned ? openTemplateInGenerator(template.id) : openQuickView(template.id)
                        }
                        className={cn(
                          "w-full rounded-lg px-3 py-2 text-xs font-bold transition-colors",
                          isOwned
                            ? "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/20"
                            : "bg-[#895af6] text-white hover:bg-[#895af6]/90",
                        )}
                      >
                        {isOwned ? "Use Template" : "View & Purchase"}
                      </button>
                    </div>
                  </Reveal>
                );
              })}
            </section>
          )}
        </div>
      </div>

      {activeTemplate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-[#895af6]/20 dark:bg-[#121216]">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-[#895af6]/10">
              <h2 className="text-lg font-bold">Template Preview</h2>
              <button
                type="button"
                onClick={closeQuickView}
                className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-[#895af6]/10"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="grid gap-0 md:grid-cols-[1.1fr_1fr]">
              <div className="bg-slate-100 dark:bg-[#0f0f15]">
                <img src={activeTemplate.imageUrl} alt={activeTemplate.title} className="h-full w-full object-cover" />
              </div>

              <div className="space-y-4 p-5">
                <div>
                  <p className="text-xs font-semibold tracking-[0.12em] text-[#895af6] uppercase">
                    {activeTemplate.styleLabel}
                  </p>
                  <h3 className="mt-1 text-2xl font-black tracking-tight">{activeTemplate.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{activeTemplate.description}</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-[#895af6]/15 dark:bg-[#0f0f15]">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Price</span>
                    <span className="font-bold text-[#895af6]">{formatCurrency(activeTemplate.priceCents)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{activeTemplate.downloadsCount.toLocaleString("en-US")} downloads</span>
                    <span>{activeTemplate.likesCount.toLocaleString("en-US")} likes</span>
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => openTemplateInGenerator(activeTemplate.id)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-[#895af6]/20 dark:bg-[#161122] dark:text-slate-200 dark:hover:bg-[#895af6]/10"
                  >
                    Use Template
                  </button>

                  {overview.isDemoData || activeTemplate.id.startsWith("tpl-demo-") ? (
                    <button
                      type="button"
                      onClick={() => copyTemplateLink(activeTemplate.id)}
                      className="rounded-lg bg-[#895af6] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#895af6]/90"
                    >
                      Copy Link
                    </button>
                  ) : ownedTemplates[activeTemplate.id] || activeTemplate.isOwnedByViewer ? (
                    <button
                      type="button"
                      onClick={() => copyTemplateLink(activeTemplate.id)}
                      className="rounded-lg bg-emerald-500/15 px-3 py-2 text-sm font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/20"
                    >
                      Owned • Copy Link
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isPurchasing}
                      onClick={() => purchaseTemplate(activeTemplate.id)}
                      className="rounded-lg bg-[#895af6] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#895af6]/90 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isPurchasing ? "Purchasing..." : `Purchase ${formatCurrency(activeTemplate.priceCents)}`}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
