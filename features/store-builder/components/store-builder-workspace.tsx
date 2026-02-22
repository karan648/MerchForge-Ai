"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, useRef, useState, useTransition } from "react";

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

interface StoreBuilderWorkspaceProps {
  overview: StorefrontOverview;
}

export function StoreBuilderWorkspace({ overview }: StoreBuilderWorkspaceProps) {
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
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-background-light dark:bg-background-dark">
      {/* Persistent Header */}
      <header className="fixed top-0 left-0 right-0 h-16 border-b border-slate-200 dark:border-[#2d2839] flex items-center justify-between px-6 bg-white/50 dark:bg-[#0f0f15]/50 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <div className="size-8 bg-[#895af6] rounded-lg flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-xl">auto_awesome</span>
          </div>
          <div>
            <h1 className="text-sm font-bold leading-none text-slate-900 dark:text-slate-100">MerchForge AI</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Changes Saved</p>
            </div>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/dashboard" className="text-xs font-medium text-slate-500 hover:text-[#895af6] transition-colors dark:text-slate-400">
            Dashboard
          </Link>
          <Link href="/dashboard/analytics" className="text-xs font-medium text-slate-500 hover:text-[#895af6] transition-colors dark:text-slate-400">
            Analytics
          </Link>
          <span className="text-xs font-medium text-slate-900 dark:text-slate-100 border-b-2 border-[#895af6] pb-5 mt-5">
            Store Builder
          </span>
          <Link href="/dashboard/settings" className="text-xs font-medium text-slate-500 hover:text-[#895af6] transition-colors dark:text-slate-400">
            Settings
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href={overview.publicStorePath}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors bg-slate-100 dark:bg-[#2d2839]/50 rounded-lg dark:text-slate-300 dark:hover:text-white"
          >
            Preview Site
          </Link>
          <button
            onClick={publishStore}
            disabled={isPublishing}
            className="px-5 py-2 text-xs font-bold bg-[#895af6] text-white rounded-lg shadow-lg shadow-[#895af6]/20 hover:brightness-110 transition-all disabled:opacity-50"
          >
            {isPublishing ? "Publishing..." : "Publish Store"}
          </button>
          <div className="size-8 rounded-full bg-[#895af6]/20 border border-[#895af6]/30 flex items-center justify-center ml-2 overflow-hidden">
            <UserAvatar fullName={overview.creatorName} avatarUrl={overview.avatarUrl} fallbackClassName="text-xs" />
          </div>
        </div>
      </header>

      {/* Scrollable Settings Panel (Left) */}
      <aside className="w-[400px] border-r border-slate-200 dark:border-[#2d2839] flex flex-col bg-white dark:bg-[#1a1a24] mt-16">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
          {notice ? <NoticeMessage notice={notice} /> : null}

          {/* Section: Banner */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[#895af6] text-lg">image</span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Store Banner</h3>
            </div>
            <div className="group relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-[#2d2839] rounded-xl bg-slate-50 dark:bg-[#0f0f15]/30 hover:border-[#895af6] transition-colors cursor-pointer overflow-hidden">
              <img
                src={bannerUrl}
                alt="Banner Preview"
                className="absolute inset-0 size-full object-cover opacity-20 group-hover:opacity-40 transition-opacity"
              />
              <div className="relative z-10 flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-slate-400 group-hover:text-[#895af6]">cloud_upload</span>
                <p className="text-[11px] text-slate-400 font-medium">Click to upload or drag &amp; drop</p>
                <p className="text-[9px] text-slate-500">Recommended size: 1920x400</p>
              </div>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
                onChange={onBannerFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </section>

          {/* Section: Profile Info */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#895af6] text-lg">person</span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Profile Details</h3>
            </div>
            <div className="flex items-center gap-4 p-4 bg-slate-100 dark:bg-[#0f0f15]/50 rounded-xl border border-slate-200 dark:border-[#2d2839]">
              <div className="relative group cursor-pointer">
                <div className="size-16 rounded-full border-2 border-[#895af6]/50 overflow-hidden">
                  <UserAvatar
                    fullName={storeName}
                    avatarUrl={overview.avatarUrl}
                    fallbackClassName="text-lg"
                  />
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="material-symbols-outlined text-white text-sm">edit</span>
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500">Storefront Name</label>
                <input
                  value={storeName}
                  onChange={(event) => setStoreName(event.target.value)}
                  className="w-full bg-transparent border-none p-0 text-sm focus:ring-0 placeholder-slate-600 font-medium text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-500">Bio / Description</label>
              <textarea
                value={storeBio}
                onChange={(event) => setStoreBio(event.target.value)}
                className="w-full bg-slate-100 dark:bg-[#0f0f15]/50 border border-slate-200 dark:border-[#2d2839] rounded-xl p-3 text-sm focus:ring-1 focus:ring-[#895af6] focus:border-[#895af6] resize-none text-slate-900 dark:text-slate-100"
                rows={3}
              />
            </div>
          </section>

          {/* Section: Theme Selection */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[#895af6] text-lg">palette</span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Theme Style</h3>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {THEME_PRESETS.map((color) => {
                const isSelected = themeColor.toLowerCase() === color.toLowerCase();
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setThemeColor(color)}
                    style={{ backgroundColor: color }}
                    className={`h-10 rounded-lg transition-transform hover:scale-105 ${
                      isSelected ? "ring-2 ring-slate-300 dark:ring-slate-800 ring-offset-2 ring-offset-white dark:ring-offset-[#1a1a24]" : ""
                    }`}
                  />
                );
              })}
              <button
                type="button"
                onClick={applyCustomColor}
                className="h-10 rounded-lg border border-slate-300 dark:border-[#2d2839] flex items-center justify-center hover:bg-slate-100 dark:hover:bg-[#2d2839]/30 transition-colors"
              >
                <span className="material-symbols-outlined text-sm text-slate-600 dark:text-slate-400">add</span>
              </button>
            </div>
          </section>

          {/* Section: Products */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#895af6] text-lg">shopping_bag</span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Products</h3>
              </div>
              <Link href="/dashboard/generator" className="text-[10px] font-bold text-[#895af6] hover:underline">
                Add New
              </Link>
            </div>
            <div className="space-y-2">
              {sidebarProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-[#0f0f15]/30 hover:bg-slate-200 dark:hover:bg-[#0f0f15]/60 rounded-xl border border-slate-200 dark:border-[#2d2839] group cursor-grab active:cursor-grabbing"
                >
                  <span className="material-symbols-outlined text-slate-400 dark:text-slate-600 cursor-move">drag_indicator</span>
                  <div className="size-10 rounded-lg bg-slate-300 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                    <img src={product.imageUrl} alt={product.title} className="size-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate text-slate-900 dark:text-slate-100">{product.title}</p>
                    <p className="text-[10px] text-slate-500">{formatCurrency(product.priceCents)}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      checked={!product.soldOut}
                      className="sr-only peer"
                      type="checkbox"
                      readOnly
                    />
                    <div className="w-8 h-4 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#895af6]" />
                  </label>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer controls */}
        <div className="p-4 border-t border-slate-200 dark:border-[#2d2839] flex items-center justify-between">
          <button className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
            <span className="material-symbols-outlined text-sm">help</span> Help Center
          </button>
          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-[#2d2839]/50 rounded-lg transition-colors">
              <span className="material-symbols-outlined text-sm">settings</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Interactive Live Preview (Right) */}
      <section className="flex-1 bg-[#f6f5f8] dark:bg-[#050508] p-8 flex flex-col items-center mt-16">
        {/* Preview Controls Overlay */}
        <div className="mb-6 flex items-center gap-1 p-1 bg-white dark:bg-[#1a1a24] border border-slate-200 dark:border-[#2d2839] rounded-xl shadow-xl">
          <button className="p-2 bg-[#895af6]/10 text-[#895af6] rounded-lg">
            <span className="material-symbols-outlined text-lg">desktop_windows</span>
          </button>
          <button className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#2d2839]/50 rounded-lg transition-colors">
            <span className="material-symbols-outlined text-lg">smartphone</span>
          </button>
          <div className="h-4 w-px bg-slate-200 dark:bg-[#2d2839] mx-2" />
          <div className="flex items-center gap-2 px-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Zoom</span>
            <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-100">85%</span>
          </div>
          <div className="h-4 w-px bg-slate-200 dark:bg-[#2d2839] mx-2" />
          <button className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#2d2839]/50 rounded-lg transition-colors">
            <span className="material-symbols-outlined text-lg">zoom_in</span>
          </button>
        </div>

        {/* Preview Frame */}
        <div className="w-full max-w-5xl flex-1 bg-white dark:bg-[#0f0f15] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#2d2839] overflow-hidden flex flex-col relative">
          {/* Mock Browser Toolbar */}
          <div className="h-10 bg-slate-100 dark:bg-[#0f0f15]/80 border-b border-slate-200 dark:border-[#2d2839] flex items-center px-4 gap-4">
            <div className="flex gap-1.5">
              <div className="size-2.5 rounded-full bg-rose-500/30" />
              <div className="size-2.5 rounded-full bg-amber-500/30" />
              <div className="size-2.5 rounded-full bg-emerald-500/30" />
            </div>
            <div className="flex-1 max-w-md mx-auto h-6 bg-white dark:bg-[#1a1a24] border border-slate-200 dark:border-[#2d2839] rounded-md flex items-center px-3 gap-2">
              <span className="material-symbols-outlined text-[10px] text-slate-500">lock</span>
              <p className="text-[10px] text-slate-500 truncate">merchforge.ai/{overview.username}</p>
            </div>
          </div>

          {/* Actual Website Mockup Scrollable */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Store Banner */}
            <div className="relative h-48 w-full" style={{ background: `linear-gradient(to right, ${themeColor}, #4f46e5)` }}>
              <img alt="Banner" className="size-full object-cover opacity-60" src={bannerUrl} />
            </div>

            <div className="max-w-4xl mx-auto px-8 -mt-10 pb-20 relative">
              {/* Profile Header */}
              <div className="flex flex-col items-center text-center">
                <div className="size-24 rounded-full border-4 border-white dark:border-[#0f0f15] overflow-hidden bg-slate-200">
                  <UserAvatar fullName={storeName} avatarUrl={overview.avatarUrl} fallbackClassName="text-2xl" />
                </div>
                <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-100">{storeName}</h2>
                <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm max-w-md">{storeBio}</p>
                <div className="flex gap-4 mt-6">
                  <button
                    type="button"
                    onClick={previewFollowStore}
                    style={previewButtonStyle}
                    className="px-6 py-2 text-white text-xs font-bold rounded-full"
                  >
                    Follow Store
                  </button>
                  <button
                    type="button"
                    onClick={sharePreviewProfile}
                    className="px-6 py-2 bg-white dark:bg-[#1a1a24] border border-slate-200 dark:border-[#2d2839] text-slate-900 dark:text-slate-100 text-xs font-bold rounded-full"
                  >
                    Share Profile
                  </button>
                </div>
              </div>

              {/* Product Grid */}
              <div className="mt-16 grid grid-cols-3 gap-6">
                {previewProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-slate-50 dark:bg-[#1a1a24]/40 rounded-xl overflow-hidden border border-slate-200 dark:border-[#2d2839]/50 hover:border-[#895af6]/50 transition-colors group cursor-pointer"
                  >
                    <div className="aspect-square bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <img
                        alt={product.title}
                        className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
                        src={product.imageUrl}
                      />
                    </div>
                    <div className="p-4 flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{product.title}</h4>
                        <p className="text-xs text-slate-500 mt-1">Apparel</p>
                      </div>
                      <p className="text-sm font-bold" style={{ color: themeColor }}>
                        {formatCurrency(product.priceCents)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Mock */}
              <footer className="mt-20 py-10 border-t border-slate-200 dark:border-[#2d2839]/30 text-center">
                <p className="text-[10px] text-slate-500 dark:text-slate-600 font-medium">Powered by MerchForge AI</p>
              </footer>
            </div>
          </div>
        </div>

        {/* Refresh/Sync Indicator Toast */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1a1a24] border border-slate-200 dark:border-[#2d2839] rounded-full shadow-2xl">
          <span className="material-symbols-outlined text-xs text-[#895af6] animate-spin">sync</span>
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">Live Syncing</span>
        </div>

        {/* Bottom floating tips */}
        <p className="mt-4 text-[11px] text-slate-500 font-medium flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">info</span>
          Tip: Use high-quality PNGs for apparel designs to ensure best print results.
        </p>
      </section>
    </div>
  );
}
