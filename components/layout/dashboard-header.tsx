"use client";

import Link from "next/link";

import { useDashboardNavState } from "@/components/layout/dashboard-nav-state";
import type { DashboardCurrentUser } from "@/components/layout/dashboard-shell";
import { useTheme } from "@/components/providers/theme-provider";
import { LogoutButton } from "@/components/ui/logout-button";
import { UserAvatar } from "@/components/ui/user-avatar";

function resolveDisplayName(user: DashboardCurrentUser): string {
  const fullName = user.fullName?.trim();
  if (fullName) {
    return fullName;
  }

  return user.username;
}

export function DashboardHeader({ currentUser }: { currentUser: DashboardCurrentUser }) {
  const { theme, toggleTheme } = useTheme();
  const { openMobileNav } = useDashboardNavState();
  const displayName = resolveDisplayName(currentUser);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-xl md:px-8 dark:border-[#895af6]/10 dark:bg-[#09090b]/80">
      <div className="flex min-w-0 flex-1 items-center gap-3 md:max-w-xl">
        <button
          type="button"
          onClick={openMobileNav}
          className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 lg:hidden dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
          aria-label="Open sidebar navigation"
        >
          <span className="material-symbols-outlined text-[20px]">menu</span>
        </button>

        <div className="group relative hidden min-w-0 flex-1 md:block">
          <span className="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#895af6] dark:text-slate-500">
            search
          </span>
          <input
            className="w-full rounded-lg border border-transparent bg-slate-100 py-2 pr-3 pl-10 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-[#895af6]/40 focus:bg-white dark:bg-[#895af6]/5 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-white/[0.08]"
            placeholder="Search designs, templates, or orders..."
            type="text"
          />
        </div>
      </div>

      <div className="ml-3 flex items-center gap-2 md:gap-4">
        <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 md:flex dark:border-[#895af6]/20 dark:bg-[#895af6]/8">
          <span className="text-xs font-bold text-[#895af6]">15 / 50</span>
          <span className="text-[10px] font-semibold tracking-[0.12em] text-slate-500 uppercase dark:text-slate-400">
            Credits
          </span>
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-200 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
          aria-label="Toggle theme"
        >
          <span className="material-symbols-outlined text-[20px]">
            {theme === "dark" ? "light_mode" : "dark_mode"}
          </span>
        </button>

        <button
          type="button"
          className="relative inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-200 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
          aria-label="Open notifications"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-2 right-2 size-1.5 rounded-full bg-[#895af6]" />
        </button>

        <LogoutButton iconOnly />

        <Link
          href="/dashboard/profile"
          className="group flex items-center gap-2 rounded-full border border-[#895af6]/25 bg-[#895af6]/10 p-0.5 pr-2 transition-colors hover:bg-[#895af6]/20"
        >
          <UserAvatar
            fullName={currentUser.fullName}
            email={currentUser.email}
            avatarUrl={currentUser.avatarUrl}
            className="size-8 border border-[#895af6]/30 bg-[#895af6]/20"
            fallbackClassName="text-[11px]"
          />
          <div className="hidden min-w-0 pr-1 sm:block">
            <p className="truncate text-xs leading-tight font-semibold text-slate-700 dark:text-slate-100">
              {displayName}
            </p>
            <p className="truncate text-[10px] leading-tight text-slate-500 dark:text-slate-400">
              Creator Account
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
}
