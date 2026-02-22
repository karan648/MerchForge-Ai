import Link from "next/link";

import { Reveal } from "@/components/ui/reveal";

import type { MockupsOverview } from "@/features/mockups/server/mockups-service";

function statusStyles(status: "Draft" | "Ready" | "Exported"): string {
  if (status === "Ready") {
    return "bg-emerald-500/10 text-emerald-500";
  }

  if (status === "Exported") {
    return "bg-[#895af6]/10 text-[#895af6]";
  }

  return "bg-slate-500/10 text-slate-500";
}

function formatDate(value: Date): string {
  return value.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function MockupsWorkspace({ overview }: { overview: MockupsOverview }) {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-8">
      <Reveal className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-[#895af6]/10 dark:bg-[#151022]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">Mockup Studio</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Build garment previews and export ready-to-sell visuals.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {overview.isDemoData ? (
              <span className="rounded-full border border-[#895af6]/25 bg-[#895af6]/10 px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-[#895af6] uppercase">
                Demo Data
              </span>
            ) : null}
            <Link
              href="/dashboard/mockups/new"
              className="inline-flex items-center gap-2 rounded-lg bg-[#895af6] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#895af6]/90"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              New Mockup
            </Link>
          </div>
        </div>
      </Reveal>

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {overview.items.map((item, index) => (
          <Reveal
            key={item.id}
            delayMs={index * 45}
            className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:-translate-y-1 hover:shadow-xl dark:border-[#895af6]/10 dark:bg-[#151022]"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-[#0f0f15]">
              <img
                src={item.previewUrl}
                alt={item.name}
                className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            <div className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{item.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {item.garmentType} • {item.garmentColor}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusStyles(item.status)}`}>
                  {item.status}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400">Updated {formatDate(item.updatedAt)}</p>
                <div className="flex items-center gap-2">
                  <a
                    href={item.previewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-slate-200 p-1.5 text-slate-600 transition-colors hover:bg-slate-100 dark:border-[#895af6]/20 dark:text-slate-300 dark:hover:bg-[#895af6]/10"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                  </a>
                  <Link
                    href={item.isDemo ? "/dashboard/mockups/new" : `/dashboard/mockups/${item.id}`}
                    className="rounded-lg border border-slate-200 p-1.5 text-slate-600 transition-colors hover:bg-slate-100 dark:border-[#895af6]/20 dark:text-slate-300 dark:hover:bg-[#895af6]/10"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {item.isDemo ? "add" : "edit"}
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </section>
    </div>
  );
}
