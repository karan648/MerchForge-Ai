"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, useRef, useState, useTransition } from "react";

import { Reveal } from "@/components/ui/reveal";
import { UserAvatar } from "@/components/ui/user-avatar";
import { publishStorefrontAction } from "@/features/store-builder/server/store-builder-actions";
import type { StorefrontOverview } from "@/features/storefront/server/storefront-service";

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

const THEME_PRESETS = [
  "#895af6",
  "#f43f5e",
  "#10b981",
  "#f59e0b",
  "#0ea5e9",
  "#6366f1",
  "#0f172a",
] as const;

const MAX_BANNER_SIZE_BYTES = 5_000_000;
const ALLOWED_BANNER_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

type StoreBuilderNotice = {
  tone: "success" | "error";
  message: string;
};

function NoticeMessage({ notice }: { notice: StoreBuilderNotice }) {
  if (notice.tone === "success") {
    return (
      <p className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-300">
        {notice.message}
      </p>
    );
  }

  return (
    <p className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300">
      {notice.message}
    </p>
  );
}

export function StoreBuilderWorkspace({ overview }: { overview: StorefrontOverview }) {
  const router = useRouter();
  const bannerInputRef = useRef<HTMLInputElement | null>(null);

  const [storeName, setStoreName] = useState(overview.creatorName);
  const [storeBio, setStoreBio] = useState(overview.creatorBio);
  const [bannerUrl, setBannerUrl] = useState(overview.heroImageUrl);
  const [themeColor, setThemeColor] = useState(overview.primaryColor);
  const [notice, setNotice] = useState<StoreBuilderNotice | null>(null);

  const [isPublishing, startPublishing] = useTransition();

  const sidebarProducts = overview.products.slice(0, 4);
  const previewProducts = overview.products.slice(0, 6);

  const previewButtonStyle = {
    backgroundColor: themeColor,
  } as const;

  function onBannerFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!ALLOWED_BANNER_TYPES.has(file.type)) {
      setNotice({
        tone: "error",
        message: "Unsupported banner format. Use JPG, PNG, WEBP, GIF, or SVG.",
      });
      return;
    }

    if (file.size > MAX_BANNER_SIZE_BYTES) {
      setNotice({
        tone: "error",
        message: "Banner file is too large. Maximum size is 5MB.",
      });
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string" || !reader.result.startsWith("data:image/")) {
        setNotice({ tone: "error", message: "Unable to read uploaded banner." });
        return;
      }

      setBannerUrl(reader.result);
      setNotice({ tone: "success", message: "Banner updated locally. Publish store to save." });
    };

    reader.onerror = () => {
      setNotice({ tone: "error", message: "Unable to read uploaded banner." });
    };

    reader.readAsDataURL(file);
  }

  function applyCustomColor() {
    const input = window.prompt("Enter a hex color (for example #895af6)", themeColor);
    if (!input) {
      return;
    }

    const normalized = input.trim();
    if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(normalized)) {
      setNotice({ tone: "error", message: "Invalid color. Use format like #895af6." });
      return;
    }

    setThemeColor(normalized);
    setNotice({ tone: "success", message: "Theme color updated locally. Publish store to save." });
  }

  function publishStore() {
    setNotice(null);

    startPublishing(async () => {
      const result = await publishStorefrontAction({
        storeName,
        bio: storeBio,
        bannerUrl,
        primaryColor: themeColor,
      });

      if (!result.ok) {
        setNotice({ tone: "error", message: result.error });
        return;
      }

      setNotice({ tone: "success", message: result.message });
      router.refresh();
    });
  }

  function previewFollowStore() {
    setNotice({
      tone: "success",
      message: "Preview follow button is active. Followers can use this in your public store.",
    });
  }

  function sharePreviewProfile() {
    const shareUrl = `${window.location.origin}${overview.publicStorePath}`;

    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        setNotice({ tone: "success", message: "Public store URL copied to clipboard." });
      })
      .catch(() => {
        setNotice({ tone: "error", message: "Unable to copy store URL." });
      });
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-8">
      <Reveal className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-[#895af6]/10 dark:bg-[#1a1a24]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              Store Builder
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Customize your storefront profile, theme, and product visibility.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={overview.publicStorePath}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-[#895af6]/20 dark:bg-[#0f0f15] dark:text-slate-200 dark:hover:bg-[#895af6]/10"
            >
              Preview Site
            </Link>
            <button
              type="button"
              onClick={publishStore}
              disabled={isPublishing}
              className="rounded-lg bg-[#895af6] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#895af6]/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPublishing ? "Publishing..." : "Publish Store"}
            </button>
          </div>
        </div>
      </Reveal>

      {notice ? <NoticeMessage notice={notice} /> : null}

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <Reveal className="h-fit rounded-2xl border border-slate-200 bg-white p-5 dark:border-[#895af6]/10 dark:bg-[#1a1a24]">
          <div className="space-y-7">
            <section>
              <div className="mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#895af6]">image</span>
                <h2 className="text-sm font-bold">Store Banner</h2>
              </div>
              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                className="relative w-full overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center transition-colors hover:border-[#895af6]/40 dark:border-[#895af6]/20 dark:bg-[#0f0f15]"
              >
                <img
                  src={bannerUrl}
                  alt="Banner preview"
                  className="absolute inset-0 size-full object-cover opacity-25"
                />
                <div className="relative z-10">
                  <span className="material-symbols-outlined text-slate-500">cloud_upload</span>
                  <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                    Upload banner (recommended 1920x400)
                  </p>
                </div>
              </button>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
                onChange={onBannerFileChange}
                className="hidden"
              />
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#895af6]">person</span>
                <h2 className="text-sm font-bold">Profile Details</h2>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-[#895af6]/20 dark:bg-[#0f0f15]">
                <span className="size-14 overflow-hidden rounded-full border border-[#895af6]/40">
                  <UserAvatar
                    fullName={storeName}
                    avatarUrl={overview.avatarUrl}
                    fallbackClassName="text-lg"
                  />
                </span>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <label className="block text-[10px] font-semibold tracking-[0.1em] text-slate-500 uppercase dark:text-slate-400">
                    Storefront Name
                  </label>
                  <input
                    value={storeName}
                    onChange={(event) => setStoreName(event.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium outline-none focus:border-[#895af6] focus:ring-2 focus:ring-[#895af6]/20 dark:border-[#895af6]/20 dark:bg-[#161122]"
                  />
                </div>
              </div>

              <label className="grid gap-1">
                <span className="text-[10px] font-semibold tracking-[0.1em] text-slate-500 uppercase dark:text-slate-400">
                  Bio / Description
                </span>
                <textarea
                  value={storeBio}
                  onChange={(event) => setStoreBio(event.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-[#895af6] focus:ring-2 focus:ring-[#895af6]/20 dark:border-[#895af6]/20 dark:bg-[#0f0f15]"
                />
              </label>
            </section>

            <section>
              <div className="mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#895af6]">palette</span>
                <h2 className="text-sm font-bold">Theme Style</h2>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {THEME_PRESETS.map((color) => {
                  const isSelected = themeColor.toLowerCase() === color.toLowerCase();

                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setThemeColor(color)}
                      style={{ backgroundColor: color }}
                      className={`h-8 rounded-lg transition-transform hover:scale-105 ${
                        isSelected
                          ? "ring-2 ring-[#895af6] ring-offset-2 ring-offset-white dark:ring-offset-[#1a1a24]"
                          : ""
                      }`}
                    />
                  );
                })}
                <button
                  type="button"
                  onClick={applyCustomColor}
                  className="flex h-8 items-center justify-center rounded-lg border border-slate-300 bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 dark:border-[#895af6]/20 dark:bg-[#0f0f15] dark:text-slate-300 dark:hover:bg-[#895af6]/10"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                </button>
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#895af6]">shopping_bag</span>
                  <h2 className="text-sm font-bold">Products</h2>
                </div>
                <Link href="/dashboard/generator" className="text-xs font-bold text-[#895af6] hover:underline">
                  Add New
                </Link>
              </div>

              <div className="space-y-2">
                {sidebarProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-[#895af6]/20 dark:bg-[#0f0f15]"
                  >
                    <span className="material-symbols-outlined text-slate-400">drag_indicator</span>
                    <img src={product.imageUrl} alt={product.title} className="size-10 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100">{product.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{formatCurrency(product.priceCents)}</p>
                    </div>
                    <span
                      className={`inline-flex size-3 rounded-full ${
                        product.soldOut ? "bg-slate-400" : "bg-emerald-500"
                      }`}
                    />
                  </div>
                ))}
              </div>
            </section>
          </div>
        </Reveal>

        <Reveal delayMs={70} className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-[#895af6]/10 dark:bg-[#050508]">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-[#895af6]/10 dark:bg-[#0f0f15]">
            <p className="text-xs font-semibold tracking-[0.14em] text-slate-500 uppercase dark:text-slate-400">
              Live Preview
            </p>
          </div>

          <div className="max-h-[760px] overflow-y-auto p-6">
            <div className="overflow-hidden rounded-xl">
              <img src={bannerUrl} alt="Store banner" className="h-44 w-full object-cover" />
            </div>

            <div className="mx-auto -mt-10 mb-8 max-w-4xl px-4 text-center">
              <span className="mx-auto size-20 overflow-hidden rounded-full border-4 border-white shadow-lg dark:border-[#050508]">
                <UserAvatar
                  fullName={storeName}
                  avatarUrl={overview.avatarUrl}
                  fallbackClassName="text-lg"
                />
              </span>
              <h3 className="mt-3 text-2xl font-bold">{storeName}</h3>
              <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">{storeBio}</p>
              <div className="mt-4 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={previewFollowStore}
                  style={previewButtonStyle}
                  className="rounded-full px-5 py-2 text-xs font-bold text-white shadow-lg"
                >
                  Follow Store
                </button>
                <button
                  type="button"
                  onClick={sharePreviewProfile}
                  className="rounded-full border border-slate-200 bg-white px-5 py-2 text-xs font-bold text-slate-700 dark:border-[#895af6]/20 dark:bg-[#161122] dark:text-slate-200"
                >
                  Share Profile
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {previewProducts.map((product) => (
                <article
                  key={product.id}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-[#895af6]/10 dark:bg-[#1a1a24]"
                >
                  <img src={product.imageUrl} alt={product.title} className="aspect-square w-full object-cover" />
                  <div className="p-3">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{product.title}</p>
                    <p className="mt-1 text-xs" style={{ color: themeColor }}>
                      {formatCurrency(product.priceCents)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
