"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";

type ProjectLogoProps = {
  collapsed?: boolean;
  href?: string;
  className?: string;
  showTier?: boolean;
};

export function ProjectLogo({
  collapsed = false,
  href = "/dashboard",
  className,
  showTier = true,
}: ProjectLogoProps) {
  return (
    <Link
      href={href}
      className={cn("group flex items-center gap-3 rounded-xl px-1 py-1 transition-colors", className)}
    >
      <span className="relative inline-flex size-10 items-center justify-center overflow-hidden rounded-xl border border-[#895af6]/40 bg-gradient-to-br from-[#9b70ff] via-[#895af6] to-[#5c3dc2] text-white shadow-lg shadow-[#895af6]/30">
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.55),transparent_45%)]" />
        <span className="material-symbols-outlined relative z-10 text-[21px]">diamond</span>
      </span>

      {collapsed ? null : (
        <span className="min-w-0">
          <span className="block truncate text-lg font-black tracking-tight text-slate-900 dark:text-slate-100">
            MerchForge <span className="text-[#895af6]">AI</span>
          </span>
          {showTier ? (
            <span className="block text-[10px] font-semibold tracking-[0.14em] text-slate-500 uppercase dark:text-slate-400">
              Creator Suite
            </span>
          ) : null}
        </span>
      )}
    </Link>
  );
}
