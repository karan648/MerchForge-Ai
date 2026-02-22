"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, useMemo, useRef, useState, useTransition } from "react";

import { LogoutButton } from "@/components/ui/logout-button";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  saveBrandKitSettingsAction,
  saveProfileSettingsAction,
} from "@/features/settings/server/settings-actions";

const AVATAR_MAX_SIZE_BYTES = 1_000_000;

const ALLOWED_AVATAR_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

const AVATAR_PRESET_SEEDS = [
  "nova-grid",
  "pixel-nexus",
  "synth-noir",
  "bold-echo",
  "radial-core",
  "quantum-bloom",
];

type SettingsWorkspaceProps = {
  user: {
    fullName: string;
    email: string;
    bio: string;
    avatarUrl: string;
  };
  brandKit: {
    brandName: string;
    logoUrl: string;
    primaryColor: string;
  };
};

function initialsFromName(value: string): string {
  const normalized = value.trim();
  if (!normalized) {
    return "MF";
  }

  const parts = normalized.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return (parts[0]?.slice(0, 2) || "MF").toUpperCase();
  }

  return `${parts[0]?.[0] || "M"}${parts[1]?.[0] || "F"}`.toUpperCase();
}

function seededNumber(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createGeneratedAvatar(seed: string, label: string): string {
  const palette = [
    ["#895af6", "#5e36d6"],
    ["#06b6d4", "#2563eb"],
    ["#f97316", "#ef4444"],
    ["#14b8a6", "#22c55e"],
    ["#0f172a", "#334155"],
    ["#d946ef", "#8b5cf6"],
  ] as const;

  const seedValue = seededNumber(seed);
  const colorPair = palette[seedValue % palette.length];
  const shapeX = 40 + (seedValue % 120);
  const shapeY = 40 + ((seedValue >> 3) % 120);
  const shapeR = 52 + ((seedValue >> 6) % 32);
  const initials = initialsFromName(label);

  // SVG data URLs avoid third-party avatar dependencies and work offline.
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
      <defs>
        <linearGradient id="avatarGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${colorPair[0]}" />
          <stop offset="100%" stop-color="${colorPair[1]}" />
        </linearGradient>
      </defs>
      <rect width="240" height="240" rx="120" fill="url(#avatarGradient)" />
      <circle cx="${shapeX}" cy="${shapeY}" r="${shapeR}" fill="rgba(255,255,255,0.22)" />
      <circle cx="180" cy="180" r="72" fill="rgba(255,255,255,0.1)" />
      <text x="120" y="135" text-anchor="middle" font-family="Manrope, Arial, sans-serif" font-size="72" font-weight="700" fill="rgba(255,255,255,0.92)">${initials}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function createRandomSeed(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function ResultMessage({ text, tone }: { text: string; tone: "success" | "error" }) {
  if (tone === "success") {
    return (
      <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
        {text}
      </p>
    );
  }

  return (
    <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
      {text}
    </p>
  );
}

export function SettingsWorkspace({ user, brandKit }: SettingsWorkspaceProps) {
  const router = useRouter();
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  const [fullName, setFullName] = useState(user.fullName);
  const [bio, setBio] = useState(user.bio);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [brandName, setBrandName] = useState(brandKit.brandName);
  const [logoUrl, setLogoUrl] = useState(brandKit.logoUrl);
  const [primaryColor, setPrimaryColor] = useState(brandKit.primaryColor);

  const [profileState, setProfileState] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);
  const [brandState, setBrandState] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);

  const [isSavingProfile, startSavingProfile] = useTransition();
  const [isSavingBrand, startSavingBrand] = useTransition();

  const avatarPresets = useMemo(
    () =>
      AVATAR_PRESET_SEEDS.map((seed) => ({
        seed,
        url: createGeneratedAvatar(`${seed}:${user.email}`, fullName || user.email),
      })),
    [fullName, user.email],
  );

  function applyRandomAvatar() {
    const randomAvatar = createGeneratedAvatar(createRandomSeed(), fullName || user.email);
    setAvatarUrl(randomAvatar);
    setProfileState({ tone: "success", message: "Random avatar selected. Save profile to persist." });
  }

  function applyPresetAvatar(presetUrl: string) {
    setAvatarUrl(presetUrl);
    setProfileState({ tone: "success", message: "Preset avatar selected. Save profile to persist." });
  }

  function clearAvatar() {
    setAvatarUrl("");
    setProfileState({ tone: "success", message: "Avatar cleared. Save profile to persist." });
  }

  function handleAvatarUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
      setProfileState({ tone: "error", message: "Unsupported file type. Use JPG, PNG, WEBP, GIF, or SVG." });
      return;
    }

    if (file.size > AVATAR_MAX_SIZE_BYTES) {
      setProfileState({ tone: "error", message: "Avatar file is too large. Maximum size is 1MB." });
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string" || !reader.result.startsWith("data:image/")) {
        setProfileState({ tone: "error", message: "Unable to read image file." });
        return;
      }

      setAvatarUrl(reader.result);
      setProfileState({ tone: "success", message: "Avatar uploaded. Save profile to persist." });
    };

    reader.onerror = () => {
      setProfileState({ tone: "error", message: "Unable to read image file." });
    };

    reader.readAsDataURL(file);
  }

  function handleSaveProfile() {
    setProfileState(null);

    startSavingProfile(async () => {
      const result = await saveProfileSettingsAction({
        fullName,
        bio,
        avatarUrl,
      });

      if (!result.ok) {
        setProfileState({ tone: "error", message: result.error });
        return;
      }

      setProfileState({ tone: "success", message: "Profile updated successfully." });
      router.refresh();
    });
  }

  function handleSaveBrandKit() {
    setBrandState(null);

    startSavingBrand(async () => {
      const result = await saveBrandKitSettingsAction({
        brandName,
        logoUrl,
        primaryColor,
      });

      if (!result.ok) {
        setBrandState({ tone: "error", message: result.error });
        return;
      }

      setBrandState({ tone: "success", message: "Brand kit updated successfully." });
      router.refresh();
    });
  }

  const profileSections = [
    { id: "profile", label: "Profile", icon: "person" },
    { id: "brand-kit", label: "Brand Kit", icon: "palette" },
    { id: "notifications", label: "Notifications", icon: "notifications" },
    { id: "security", label: "Security", icon: "shield" },
    { id: "integrations", label: "Integrations", icon: "extension" },
    { id: "api-keys", label: "API Keys", icon: "key" },
  ];

  return (
    <div className="mx-auto flex w-full max-w-7xl gap-8 p-6 md:p-8">
      <aside className="hidden h-fit w-64 shrink-0 rounded-xl border border-slate-200 bg-white p-4 lg:block dark:border-white/10 dark:bg-white/5">
        <nav className="space-y-1">
          {profileSections.map((item, index) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={
                index === 0
                  ? "flex items-center gap-3 rounded-lg bg-[#895af6]/12 px-3 py-2 text-sm font-medium text-[#a986fa]"
                  : "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"
              }
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1 space-y-12">
        <section id="profile" className="rounded-xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/5">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4 dark:border-white/10">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Profile Settings</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Manage your public profile and account details.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                className="inline-flex items-center gap-2 rounded-lg bg-[#895af6] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#895af6]/90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                {isSavingProfile ? "Saving..." : "Save Profile"}
              </button>
              <LogoutButton />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-[auto_1fr]">
            <div className="space-y-4">
              <div className="relative">
                <div className="size-24 overflow-hidden rounded-full border border-[#895af6]/30 bg-[#895af6]/10">
                  <UserAvatar
                    fullName={fullName}
                    email={user.email}
                    avatarUrl={avatarUrl}
                    fallbackClassName="text-lg"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => uploadInputRef.current?.click()}
                  className="absolute right-0 bottom-0 inline-flex size-8 items-center justify-center rounded-full border border-[#895af6]/30 bg-[#895af6] text-white shadow-md shadow-[#895af6]/25 transition-colors hover:bg-[#895af6]/90"
                  aria-label="Upload avatar image"
                >
                  <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                </button>
              </div>

              <input
                ref={uploadInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
                onChange={handleAvatarUpload}
                className="hidden"
              />

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => uploadInputRef.current?.click()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-white/10 dark:bg-[#0f0f12] dark:text-slate-200 dark:hover:bg-white/10"
                >
                  <span className="material-symbols-outlined text-[16px]">upload</span>
                  Upload Image
                </button>
                <button
                  type="button"
                  onClick={applyRandomAvatar}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-white/10 dark:bg-[#0f0f12] dark:text-slate-200 dark:hover:bg-white/10"
                >
                  <span className="material-symbols-outlined text-[16px]">shuffle</span>
                  Random Avatar
                </button>
                <button
                  type="button"
                  onClick={clearAvatar}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-500/15 dark:text-red-300"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                  Remove Avatar
                </button>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                JPG, PNG, GIF, WEBP, or SVG. Max size 1MB.
              </p>
            </div>

            <div className="grid gap-4">
              <label className="grid gap-1">
                <span className="text-sm font-medium">Full Name</span>
                <input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-[#895af6] focus:ring-2 focus:ring-[#895af6]/20 dark:border-white/10 dark:bg-[#0f0f12]"
                />
              </label>

              <label className="grid gap-1">
                <span className="text-sm font-medium">Email</span>
                <input
                  value={user.email}
                  readOnly
                  className="cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500 dark:border-white/10 dark:bg-[#0f0f12] dark:text-slate-400"
                />
              </label>

              <label className="grid gap-1">
                <span className="text-sm font-medium">Avatar URL (optional)</span>
                <input
                  value={avatarUrl}
                  onChange={(event) => setAvatarUrl(event.target.value)}
                  placeholder="https://..."
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-[#895af6] focus:ring-2 focus:ring-[#895af6]/20 dark:border-white/10 dark:bg-[#0f0f12]"
                />
              </label>

              <div className="space-y-2">
                <p className="text-sm font-medium">Preset Avatars</p>
                <div className="grid grid-cols-6 gap-2">
                  {avatarPresets.map((preset) => {
                    const isActive = avatarUrl === preset.url;

                    return (
                      <button
                        key={preset.seed}
                        type="button"
                        onClick={() => applyPresetAvatar(preset.url)}
                        className={`relative size-11 overflow-hidden rounded-full border transition-colors ${
                          isActive
                            ? "border-[#895af6] ring-2 ring-[#895af6]/30"
                            : "border-slate-200 hover:border-[#895af6]/50 dark:border-white/10"
                        }`}
                        aria-label="Select avatar preset"
                      >
                        <img src={preset.url} alt="Avatar preset" className="size-full object-cover" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="grid gap-1">
                <span className="text-sm font-medium">Bio</span>
                <textarea
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  rows={4}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-[#895af6] focus:ring-2 focus:ring-[#895af6]/20 dark:border-white/10 dark:bg-[#0f0f12]"
                  placeholder="Tell your audience about your store style..."
                />
              </label>

              {profileState ? <ResultMessage text={profileState.message} tone={profileState.tone} /> : null}
            </div>
          </div>
        </section>

        <section id="brand-kit" className="rounded-xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/5">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4 dark:border-white/10">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Brand Kit</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Keep generation output aligned with your brand.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSaveBrandKit}
              disabled={isSavingBrand}
              className="inline-flex items-center gap-2 rounded-lg bg-[#895af6] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#895af6]/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              {isSavingBrand ? "Saving..." : "Save Brand Kit"}
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-1">
              <span className="text-sm font-medium">Brand Name</span>
              <input
                value={brandName}
                onChange={(event) => setBrandName(event.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-[#895af6] focus:ring-2 focus:ring-[#895af6]/20 dark:border-white/10 dark:bg-[#0f0f12]"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm font-medium">Primary Color (hex)</span>
              <div className="flex items-center gap-2">
                <input
                  value={primaryColor}
                  onChange={(event) => setPrimaryColor(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-[#895af6] focus:ring-2 focus:ring-[#895af6]/20 dark:border-white/10 dark:bg-[#0f0f12]"
                  placeholder="#895af6"
                />
                <span
                  className="size-9 rounded-lg border border-slate-200 dark:border-white/10"
                  style={{ backgroundColor: /^#/.test(primaryColor) ? primaryColor : "#895af6" }}
                />
              </div>
            </label>

            <label className="grid gap-1 md:col-span-2">
              <span className="text-sm font-medium">Brand Logo URL</span>
              <input
                value={logoUrl}
                onChange={(event) => setLogoUrl(event.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-[#895af6] focus:ring-2 focus:ring-[#895af6]/20 dark:border-white/10 dark:bg-[#0f0f12]"
                placeholder="https://..."
              />
            </label>
          </div>

          {brandState ? <ResultMessage text={brandState.message} tone={brandState.tone} /> : null}
        </section>

        <section id="notifications" className="rounded-xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/5">
          <h3 className="text-lg font-semibold">Notifications</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Notification controls will be connected to user preferences in the next backend pass.
          </p>
        </section>

        <section id="security" className="rounded-xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/5">
          <h3 className="text-lg font-semibold">Security</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Password resets, active sessions, and MFA controls will appear here.
          </p>
        </section>

        <section id="integrations" className="rounded-xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/5">
          <h3 className="text-lg font-semibold">Integrations</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Provider integrations (Printful, Printify, Shopify) will appear here.
          </p>
        </section>

        <section id="api-keys" className="rounded-xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/5">
          <h3 className="text-lg font-semibold">API Keys</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Secure API key management UI will be added with role-based permissions.
          </p>
        </section>
      </div>
    </div>
  );
}
