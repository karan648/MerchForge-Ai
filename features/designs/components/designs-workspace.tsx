import Link from "next/link";

import { Reveal } from "@/components/ui/reveal";

import type { DesignsOverview } from "@/features/designs/server/designs-service";

function formatDate(value: Date): string {
  return value.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function statusClass(status: "Live" | "Draft" | "Archived"): string {
  if (status === "Live") {
    return "bg-emerald-500";
  }

  if (status === "Archived") {
    return "bg-slate-500";
  }

  return "bg-[#895af6]";
}

export function DesignsWorkspace({ overview }: { overview: DesignsOverview }) {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-8">
      <Reveal className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-[#895af6]/10 dark:bg-[#151022]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              My Designs
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Manage generated artwork, publish to storefront, and version your best sellers.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {overview.isDemoData ? (
              <span className="rounded-full border border-[#895af6]/25 bg-[#895af6]/10 px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-[#895af6] uppercase">
                Demo Data
              </span>
            ) : null}
            <Link
              href="/dashboard/generator"
              className="inline-flex items-center gap-2 rounded-lg bg-[#895af6] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#895af6]/90"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              New Design
            </Link>
          </div>
        </div>
      </Reveal>

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Reveal className="flex h-[320px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-center transition-colors hover:border-[#895af6]/60 hover:bg-[#895af6]/5 dark:border-[#895af6]/20 dark:bg-[#0f0f15]">
          <Link href="/dashboard/generator" className="flex flex-col items-center">
            <span className="mb-3 flex size-12 items-center justify-center rounded-full bg-[#895af6]/10 text-[#895af6]">
              <span className="material-symbols-outlined text-3xl">add</span>
            </span>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Create New Design</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Start with AI prompt</p>
          </Link>
        </Reveal>

        {overview.designs.map((design, index) => (
          <Reveal
            key={design.id}
            delayMs={index * 35}
            className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:-translate-y-1 hover:shadow-xl dark:border-[#895af6]/10 dark:bg-[#151022]"
          >
            <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-[#0f0f15]">
              <span
                className={`absolute top-3 left-3 z-10 rounded px-2 py-1 text-[10px] font-bold tracking-[0.08em] text-white uppercase ${statusClass(
                  design.status,
                )}`}
              >
                {design.status}
              </span>
              <img
                src={design.imageUrl}
                alt={design.title}
                className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/35 opacity-0 transition-opacity group-hover:opacity-100">
                <button type="button" className="rounded-full bg-white p-2 text-slate-900">
                  <span className="material-symbols-outlined text-base">edit</span>
                </button>
                <button type="button" className="rounded-full bg-white p-2 text-slate-900">
                  <span className="material-symbols-outlined text-base">visibility</span>
                </button>
              </div>
            </div>

            <div className="space-y-1 p-4">
              <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">{design.title}</p>
              <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{design.prompt}</p>
              <p className="pt-1 text-xs text-slate-500 dark:text-slate-400">Generated {formatDate(design.createdAt)}</p>
            </div>
          </Reveal>
        ))}
      </section>
    </div>
  );
}

