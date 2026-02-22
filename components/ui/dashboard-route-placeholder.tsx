import Link from "next/link";

import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

type DashboardRoutePlaceholderProps = {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
};

export function DashboardRoutePlaceholder({
  title,
  description,
  ctaLabel = "Back to Dashboard",
  ctaHref = "/dashboard",
  className,
}: DashboardRoutePlaceholderProps) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl p-6 md:p-8", className)}>
      <Reveal className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl md:p-10 dark:border-white/10 dark:bg-white/[0.03] dark:shadow-2xl">
        <p className="mb-3 inline-flex rounded-full border border-[#895af6]/30 bg-[#895af6]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#895af6]">
          Workspace Module
        </p>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl dark:text-slate-100">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-slate-600 dark:text-slate-400">{description}</p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2 rounded-lg bg-[#895af6] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#895af6]/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#895af6]/90"
          >
            {ctaLabel}
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </Link>
          <Link
            href="/dashboard/generator"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:bg-slate-200 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
          >
            Open AI Generator
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
