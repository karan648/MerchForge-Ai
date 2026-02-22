"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { cn } from "@/lib/utils";

type LogoutButtonProps = {
  className?: string;
  iconOnly?: boolean;
};

export function LogoutButton({ className, iconOnly = false }: LogoutButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleLogout() {
    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/logout", {
          method: "POST",
        });

        if (!response.ok) {
          setError("Unable to sign out.");
          return;
        }

        router.push("/login");
        router.refresh();
      } catch {
        setError("Unable to sign out.");
      }
    });
  }

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={handleLogout}
        disabled={isPending}
        aria-label="Sign out"
        title={error ?? "Sign out"}
        className={cn(
          "inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10",
          className,
        )}
      >
        <span className="material-symbols-outlined text-[20px]">logout</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-70 dark:text-red-300",
        className,
      )}
    >
      <span className="material-symbols-outlined text-[18px]">logout</span>
      {isPending ? "Signing out..." : "Sign Out"}
    </button>
  );
}
