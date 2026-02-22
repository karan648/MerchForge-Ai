"use client";

import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";

type ThemeToggleButtonProps = {
  className?: string;
};

export function ThemeToggleButton({ className }: ThemeToggleButtonProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition-all hover:-translate-y-0.5 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10",
        className,
      )}
    >
      <span className="material-symbols-outlined text-[20px]">
        {theme === "dark" ? "light_mode" : "dark_mode"}
      </span>
    </button>
  );
}
