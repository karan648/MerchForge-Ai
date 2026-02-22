import { Reveal } from "@/components/ui/reveal";

import type { BillingOverview } from "@/features/billing/server/billing-service";

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function invoiceStatusClasses(status: "Paid" | "Pending" | "Refunded"): string {
  if (status === "Paid") {
    return "bg-emerald-500/10 text-emerald-500";
  }

  if (status === "Pending") {
    return "bg-amber-500/10 text-amber-500";
  }

  return "bg-slate-500/10 text-slate-500";
}

export function BillingWorkspace({ overview }: { overview: BillingOverview }) {
  const creditPercent =
    overview.monthlyCredits > 0
      ? Math.min(Math.round((overview.creditsUsed / overview.monthlyCredits) * 100), 100)
      : 0;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-8">
      <Reveal className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-[#895af6]/10 dark:bg-[#151022]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              Billing &amp; Subscription
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Manage your plan, credits, and payment history.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 dark:border-[#895af6]/20 dark:bg-[#895af6]/10 dark:text-slate-300">
            <span className="material-symbols-outlined text-[14px]">schedule</span>
            Next billing date: {overview.nextBillingDateLabel}
          </div>
        </div>
      </Reveal>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Reveal className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#895af6]/10 dark:bg-[#151022]">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold tracking-[0.16em] text-slate-500 uppercase dark:text-slate-400">
                Current Plan
              </p>
              <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-100">{overview.planName}</h2>
              <p className="mt-1 text-lg font-semibold text-[#895af6]">{overview.planPriceLabel}</p>
            </div>
            <span className="rounded-full border border-[#895af6]/30 bg-[#895af6]/10 px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-[#895af6] uppercase">
              {overview.planStatusLabel}
            </span>
          </div>

          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-[#895af6]">check_circle</span>
              Unlimited design projects
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-[#895af6]">check_circle</span>
              Priority AI rendering queue
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-[#895af6]">check_circle</span>
              HD mockup and export access
            </li>
          </ul>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="rounded-lg bg-[#895af6] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#895af6]/90"
            >
              Change Plan
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100 dark:border-[#895af6]/20 dark:bg-[#0f0f15] dark:text-slate-200 dark:hover:bg-[#895af6]/10"
            >
              Cancel
            </button>
          </div>
        </Reveal>

        <Reveal delayMs={70} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#895af6]/10 dark:bg-[#151022]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-[10px] font-bold tracking-[0.16em] text-slate-500 uppercase dark:text-slate-400">
              Credits Usage
            </p>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500 dark:bg-[#895af6]/10 dark:text-slate-300">
              {overview.creditsRemaining} remaining
            </span>
          </div>

          <div className="mb-4 flex items-end justify-between">
            <p className="text-4xl font-black text-slate-900 dark:text-slate-100">
              {overview.creditsUsed}
              <span className="text-2xl font-bold text-slate-400"> / {overview.monthlyCredits}</span>
            </p>
            <p className="text-xs font-semibold text-[#895af6]">{creditPercent}% used</p>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#895af6]/70 to-[#895af6]"
              style={{ width: `${creditPercent}%` }}
            />
          </div>

          <button
            type="button"
            className="mt-6 w-full rounded-lg border border-[#895af6]/30 bg-[#895af6]/10 px-4 py-2.5 text-sm font-bold text-[#895af6] transition-colors hover:bg-[#895af6]/15"
          >
            Top Up Credits
          </button>
        </Reveal>
      </section>

      <Reveal delayMs={100} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-[#895af6]/10 dark:bg-[#151022]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">Payment Methods</h3>
          <button type="button" className="text-sm font-bold text-[#895af6] hover:underline">
            Add New Method
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-[#895af6]/20 dark:bg-[#0f0f15]">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Visa ending in 4242</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Expires 12/26 • Default</p>
            </div>
            <span className="rounded-full border border-[#895af6]/30 bg-[#895af6]/10 px-2 py-0.5 text-[10px] font-bold text-[#895af6] uppercase">
              Primary
            </span>
          </div>
          <button
            type="button"
            className="rounded-xl border-2 border-dashed border-slate-200 px-4 py-4 text-sm font-medium text-slate-500 transition-colors hover:border-[#895af6]/40 hover:text-[#895af6] dark:border-[#895af6]/20 dark:text-slate-400"
          >
            Add a secondary payment method
          </button>
        </div>
      </Reveal>

      <Reveal delayMs={130} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-[#895af6]/10 dark:bg-[#151022]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">Invoice History</h3>
          {overview.isDemoData ? (
            <span className="rounded-full border border-[#895af6]/25 bg-[#895af6]/10 px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-[#895af6] uppercase">
              Demo Data
            </span>
          ) : null}
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-[#895af6]/10">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left dark:border-[#895af6]/10 dark:bg-[#895af6]/5">
                  <th className="px-4 py-3 text-[11px] font-bold tracking-[0.1em] text-slate-500 uppercase dark:text-slate-400">
                    Date
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold tracking-[0.1em] text-slate-500 uppercase dark:text-slate-400">
                    Description
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold tracking-[0.1em] text-slate-500 uppercase dark:text-slate-400">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold tracking-[0.1em] text-slate-500 uppercase dark:text-slate-400">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold tracking-[0.1em] text-slate-500 uppercase dark:text-slate-400">
                    Receipt
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#895af6]/10">
                {overview.invoices.map((invoice) => (
                  <tr key={invoice.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-[#895af6]/5">
                    <td className="px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                      {formatDate(invoice.date)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{invoice.description}</td>
                    <td className="px-4 py-3 text-sm font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(invoice.amountCents)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${invoiceStatusClasses(invoice.statusLabel)}`}>
                        {invoice.statusLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-[#895af6] transition-colors hover:bg-[#895af6]/10"
                      >
                        <span className="material-symbols-outlined text-base">download</span>
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

