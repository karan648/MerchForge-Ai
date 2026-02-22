import { Reveal } from "@/components/ui/reveal";

import type { AnalyticsOverview } from "@/features/analytics/server/analytics-service";

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function AnalyticsWorkspace({ overview }: { overview: AnalyticsOverview }) {
  const maxBar = Math.max(...overview.monthlyRevenue.map((point) => point.valueCents), 1);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-8">
      <Reveal className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-[#895af6]/10 dark:bg-[#151022]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">Analytics</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Revenue, orders, conversion, and top product performance.
            </p>
          </div>
          {overview.isDemoData ? (
            <span className="rounded-full border border-[#895af6]/25 bg-[#895af6]/10 px-3 py-1 text-[10px] font-bold tracking-[0.12em] text-[#895af6] uppercase">
              Demo Data
            </span>
          ) : null}
        </div>
      </Reveal>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Reveal className="rounded-xl border border-slate-200 bg-white p-4 dark:border-[#895af6]/10 dark:bg-[#151022]">
          <p className="text-[10px] font-semibold tracking-[0.14em] text-slate-500 uppercase dark:text-slate-400">
            Revenue
          </p>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">
            {formatCurrency(overview.totals.revenueCents)}
          </p>
        </Reveal>
        <Reveal delayMs={50} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-[#895af6]/10 dark:bg-[#151022]">
          <p className="text-[10px] font-semibold tracking-[0.14em] text-slate-500 uppercase dark:text-slate-400">
            Paid Orders
          </p>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">{overview.totals.orders}</p>
        </Reveal>
        <Reveal delayMs={100} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-[#895af6]/10 dark:bg-[#151022]">
          <p className="text-[10px] font-semibold tracking-[0.14em] text-slate-500 uppercase dark:text-slate-400">
            Conversion
          </p>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">
            {overview.totals.conversionPercent}%
          </p>
        </Reveal>
        <Reveal delayMs={150} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-[#895af6]/10 dark:bg-[#151022]">
          <p className="text-[10px] font-semibold tracking-[0.14em] text-slate-500 uppercase dark:text-slate-400">
            Traffic
          </p>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">
            {overview.totals.traffic.toLocaleString("en-US")}
          </p>
        </Reveal>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Reveal className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-[#895af6]/10 dark:bg-[#151022]">
          <h2 className="mb-5 text-lg font-bold text-slate-900 dark:text-slate-100">Revenue Trend (6 months)</h2>
          <div className="grid h-64 grid-cols-6 items-end gap-3">
            {overview.monthlyRevenue.map((point, index) => {
              const heightPercent = Math.max(Math.round((point.valueCents / maxBar) * 100), 8);

              return (
                <Reveal key={point.label} delayMs={index * 40} className="flex flex-col items-center gap-2">
                  <div className="flex h-52 w-full items-end">
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-[#895af6] to-[#b699fb]"
                      style={{ height: `${heightPercent}%` }}
                      title={`${point.label}: ${formatCurrency(point.valueCents)}`}
                    />
                  </div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{point.label}</p>
                </Reveal>
              );
            })}
          </div>
        </Reveal>

        <Reveal delayMs={80} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-[#895af6]/10 dark:bg-[#151022]">
          <h2 className="mb-5 text-lg font-bold text-slate-900 dark:text-slate-100">Top Products</h2>
          <div className="space-y-3">
            {overview.topProducts.map((product, index) => (
              <Reveal
                key={product.id}
                delayMs={index * 45}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-[#895af6]/15 dark:bg-[#0f0f15]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{product.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Rank #{index + 1}</p>
                </div>
                <span className="rounded-full bg-[#895af6]/10 px-2.5 py-1 text-xs font-bold text-[#895af6]">
                  {product.orders} orders
                </span>
              </Reveal>
            ))}
          </div>
        </Reveal>
      </div>
    </div>
  );
}

