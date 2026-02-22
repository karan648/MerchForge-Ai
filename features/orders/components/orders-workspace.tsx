"use client";

import { useMemo, useState, useTransition } from "react";

import { Reveal } from "@/components/ui/reveal";
import { updateOrderStatusAction } from "@/features/orders/server/order-actions";
import type { OrdersOverview } from "@/features/orders/server/orders-service";
import { cn } from "@/lib/utils";

type StatusFilter = "ALL" | "DELIVERED" | "SHIPPED" | "PROCESSING" | "CANCELED";
type DateFilter = "7D" | "30D" | "90D" | "ALL_TIME";

type OrderTone = "success" | "processing" | "warning" | "neutral";

type ActionType = "MARK_SHIPPED" | "MARK_DELIVERED" | "CANCEL_ORDER";

type RowActionOption = {
  action: ActionType;
  label: string;
};

const ORDER_STATUS = {
  PENDING: "PENDING",
  PAID: "PAID",
  FULFILLMENT: "FULFILLMENT",
  IN_PRODUCTION: "IN_PRODUCTION",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELED: "CANCELED",
  REFUNDED: "REFUNDED",
} as const;

const PAYMENT_STATUS = {
  REFUNDED: "REFUNDED",
} as const;

const SHIPPABLE_STATUSES = new Set<string>([
  ORDER_STATUS.PENDING,
  ORDER_STATUS.PAID,
  ORDER_STATUS.FULFILLMENT,
  ORDER_STATUS.IN_PRODUCTION,
]);

const PROCESSING_STATUSES = new Set<string>([
  ORDER_STATUS.PENDING,
  ORDER_STATUS.PAID,
  ORDER_STATUS.FULFILLMENT,
  ORDER_STATUS.IN_PRODUCTION,
]);

const STATUS_FILTER_LABEL: Record<StatusFilter, string> = {
  ALL: "All",
  DELIVERED: "Delivered",
  SHIPPED: "Shipped",
  PROCESSING: "Processing",
  CANCELED: "Canceled",
};

const DATE_FILTER_LABEL: Record<DateFilter, string> = {
  "7D": "Last 7 Days",
  "30D": "Last 30 Days",
  "90D": "Last 90 Days",
  ALL_TIME: "All Time",
};

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

function formatOrderDate(dateIso: string): string {
  const date = new Date(dateIso);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toneClasses(tone: OrderTone): string {
  if (tone === "success") {
    return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
  }

  if (tone === "processing") {
    return "bg-[#895af6]/10 text-[#895af6] border-[#895af6]/20";
  }

  if (tone === "warning") {
    return "bg-amber-500/10 text-amber-500 border-amber-500/20";
  }

  return "bg-slate-500/10 text-slate-500 border-slate-500/20";
}

function computeNextActionOptions(row: OrdersOverview["rows"][number]): RowActionOption[] {
  if (SHIPPABLE_STATUSES.has(row.orderStatus)) {
    return [
      { action: "MARK_SHIPPED", label: "Mark as Shipped" },
      { action: "CANCEL_ORDER", label: "Cancel Order" },
    ];
  }

  if (row.orderStatus === ORDER_STATUS.SHIPPED) {
    return [
      { action: "MARK_DELIVERED", label: "Mark as Delivered" },
      { action: "CANCEL_ORDER", label: "Cancel Order" },
    ];
  }

  return [];
}

function statusMatchesFilter(row: OrdersOverview["rows"][number], filter: StatusFilter): boolean {
  if (filter === "ALL") {
    return true;
  }

  if (filter === "DELIVERED") {
    return row.orderStatus === ORDER_STATUS.DELIVERED;
  }

  if (filter === "SHIPPED") {
    return row.orderStatus === ORDER_STATUS.SHIPPED || row.orderStatus === ORDER_STATUS.IN_PRODUCTION;
  }

  if (filter === "PROCESSING") {
    return PROCESSING_STATUSES.has(row.orderStatus);
  }

  return (
    row.orderStatus === ORDER_STATUS.CANCELED || row.paymentStatus === PAYMENT_STATUS.REFUNDED
  );
}

function dateMatchesFilter(row: OrdersOverview["rows"][number], filter: DateFilter): boolean {
  if (filter === "ALL_TIME") {
    return true;
  }

  const rowDate = new Date(row.createdAtIso);
  if (Number.isNaN(rowDate.valueOf())) {
    return false;
  }

  const days = filter === "7D" ? 7 : filter === "30D" ? 30 : 90;
  const threshold = Date.now() - days * 24 * 60 * 60 * 1000;

  return rowDate.valueOf() >= threshold;
}

function buildCsv(rows: OrdersOverview["rows"]): string {
  const header = ["Order ID", "Product", "Customer", "Status", "Amount", "Date"];
  const lines = rows.map((row) => [
    row.id,
    row.productTitle,
    row.customerName,
    row.statusLabel,
    (row.amountCents / 100).toFixed(2),
    row.createdAtIso,
  ]);

  return [header, ...lines]
    .map((line) =>
      line
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\n");
}

function mapUpdatedTone(value: "success" | "processing" | "warning" | "neutral"): OrderTone {
  return value;
}

export function OrdersWorkspace({ overview }: { overview: OrdersOverview }) {
  const [rows, setRows] = useState(overview.rows);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [dateFilter, setDateFilter] = useState<DateFilter>("30D");
  const [openStatusMenu, setOpenStatusMenu] = useState(false);
  const [openDateMenu, setOpenDateMenu] = useState(false);
  const [activeRowMenuId, setActiveRowMenuId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  const [isMutating, startMutation] = useTransition();

  const filteredRows = useMemo(
    () => rows.filter((row) => statusMatchesFilter(row, statusFilter) && dateMatchesFilter(row, dateFilter)),
    [dateFilter, rows, statusFilter],
  );

  function exportFilteredCsv() {
    if (filteredRows.length === 0) {
      setNotice({ tone: "error", message: "No rows match your filters." });
      return;
    }

    const csvContent = buildCsv(filteredRows);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();

    URL.revokeObjectURL(url);
    setNotice({ tone: "success", message: "CSV exported successfully." });
  }

  function copyOrderId(orderId: string) {
    navigator.clipboard
      .writeText(orderId)
      .then(() => {
        setNotice({ tone: "success", message: `Order ID ${orderId.slice(0, 8)} copied.` });
      })
      .catch(() => {
        setNotice({ tone: "error", message: "Unable to copy order ID." });
      });
  }

  function updateStatus(orderId: string, action: ActionType) {
    setNotice(null);
    setActiveRowMenuId(null);

    startMutation(async () => {
      const result = await updateOrderStatusAction({ orderId, action });

      if (!result.ok) {
        setNotice({ tone: "error", message: result.error });
        return;
      }

      setRows((current) =>
        current.map((row) => {
          if (row.id !== orderId) {
            return row;
          }

          return {
            ...row,
            orderStatus: result.orderStatus,
            paymentStatus: result.paymentStatus,
            statusLabel: result.statusLabel,
            statusTone: mapUpdatedTone(result.statusTone),
          };
        }),
      );

      setNotice({ tone: "success", message: result.message });
    });
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-8">
      {notice ? (
        <div
          className={cn(
            "rounded-lg border px-3 py-2 text-sm",
            notice.tone === "success"
              ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
              : "border-red-500/25 bg-red-500/10 text-red-300",
          )}
        >
          {notice.message}
        </div>
      ) : null}

      <Reveal className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-[#895af6]/10 dark:bg-[#161122]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span>Dashboard</span>
              <span className="material-symbols-outlined text-[10px]">chevron_right</span>
              <span className="text-[#895af6]">Orders</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Order Management
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Track fulfillment, review payments, and monitor customer activity.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-[#895af6]/15 dark:bg-[#895af6]/5">
              <p className="text-[10px] font-semibold tracking-[0.14em] text-slate-500 uppercase dark:text-slate-400">
                Total Orders
              </p>
              <p className="mt-1 text-xl font-bold">{overview.totals.orders}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-[#895af6]/15 dark:bg-[#895af6]/5">
              <p className="text-[10px] font-semibold tracking-[0.14em] text-slate-500 uppercase dark:text-slate-400">
                Delivered
              </p>
              <p className="mt-1 text-xl font-bold">{overview.totals.delivered}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-[#895af6]/15 dark:bg-[#895af6]/5">
              <p className="text-[10px] font-semibold tracking-[0.14em] text-slate-500 uppercase dark:text-slate-400">
                Pending
              </p>
              <p className="mt-1 text-xl font-bold">{overview.totals.pending}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-[#895af6]/15 dark:bg-[#895af6]/5">
              <p className="text-[10px] font-semibold tracking-[0.14em] text-slate-500 uppercase dark:text-slate-400">
                Revenue
              </p>
              <p className="mt-1 text-xl font-bold">{formatCurrency(overview.totals.revenueCents)}</p>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delayMs={70} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-[#895af6]/10 dark:bg-[#161122]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setOpenStatusMenu((current) => !current);
                  setOpenDateMenu(false);
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-[#895af6]/10 dark:text-slate-200 dark:hover:bg-[#895af6]/20"
              >
                <span className="material-symbols-outlined text-sm">filter_list</span>
                Status: {STATUS_FILTER_LABEL[statusFilter]}
              </button>

              {openStatusMenu ? (
                <div className="absolute top-[calc(100%+6px)] left-0 z-20 min-w-[170px] rounded-lg border border-slate-200 bg-white p-1 shadow-lg dark:border-[#895af6]/20 dark:bg-[#0f0f15]">
                  {(Object.keys(STATUS_FILTER_LABEL) as StatusFilter[]).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => {
                        setStatusFilter(filter);
                        setOpenStatusMenu(false);
                      }}
                      className={cn(
                        "flex w-full items-center rounded-md px-2.5 py-2 text-left text-xs font-medium transition-colors",
                        statusFilter === filter
                          ? "bg-[#895af6]/10 text-[#895af6]"
                          : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-[#895af6]/10",
                      )}
                    >
                      {STATUS_FILTER_LABEL[filter]}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setOpenDateMenu((current) => !current);
                  setOpenStatusMenu(false);
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-[#895af6]/10 dark:text-slate-200 dark:hover:bg-[#895af6]/20"
              >
                <span className="material-symbols-outlined text-sm">calendar_month</span>
                Date: {DATE_FILTER_LABEL[dateFilter]}
              </button>

              {openDateMenu ? (
                <div className="absolute top-[calc(100%+6px)] left-0 z-20 min-w-[170px] rounded-lg border border-slate-200 bg-white p-1 shadow-lg dark:border-[#895af6]/20 dark:bg-[#0f0f15]">
                  {(Object.keys(DATE_FILTER_LABEL) as DateFilter[]).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => {
                        setDateFilter(filter);
                        setOpenDateMenu(false);
                      }}
                      className={cn(
                        "flex w-full items-center rounded-md px-2.5 py-2 text-left text-xs font-medium transition-colors",
                        dateFilter === filter
                          ? "bg-[#895af6]/10 text-[#895af6]"
                          : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-[#895af6]/10",
                      )}
                    >
                      {DATE_FILTER_LABEL[filter]}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <p className="px-1 text-xs text-slate-500 dark:text-slate-400">
              Showing {filteredRows.length} order{filteredRows.length === 1 ? "" : "s"}
            </p>

            {overview.isDemoData ? (
              <span className="rounded-full border border-[#895af6]/25 bg-[#895af6]/10 px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-[#895af6] uppercase">
                Demo Data
              </span>
            ) : null}
          </div>

          <button
            type="button"
            onClick={exportFilteredCsv}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-[#895af6]/20 dark:bg-[#0f0f15] dark:text-slate-200 dark:hover:bg-[#895af6]/10"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            Export CSV
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-[#895af6]/10">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left dark:border-[#895af6]/10 dark:bg-[#895af6]/5">
                  <th className="px-4 py-3 text-[11px] font-bold tracking-[0.1em] text-slate-500 uppercase dark:text-slate-400">
                    Product
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold tracking-[0.1em] text-slate-500 uppercase dark:text-slate-400">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold tracking-[0.1em] text-slate-500 uppercase dark:text-slate-400">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold tracking-[0.1em] text-slate-500 uppercase dark:text-slate-400">
                    Price
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold tracking-[0.1em] text-slate-500 uppercase dark:text-slate-400">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold tracking-[0.1em] text-slate-500 uppercase dark:text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#895af6]/10">
                {filteredRows.map((row) => {
                  const actionOptions = computeNextActionOptions(row);

                  return (
                    <tr key={row.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-[#895af6]/5">
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{row.productTitle}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">ID: {row.id.slice(0, 8)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-slate-700 dark:text-slate-300">{row.customerName}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${toneClasses(
                            row.statusTone,
                          )}`}
                        >
                          <span className="size-1.5 rounded-full bg-current" />
                          {row.statusLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-slate-900 dark:text-slate-100">
                        {formatCurrency(row.amountCents)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                        {formatOrderDate(row.createdAtIso)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="relative inline-flex">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveRowMenuId((current) => (current === row.id ? null : row.id))
                            }
                            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#895af6] dark:hover:bg-[#895af6]/10"
                          >
                            <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                          </button>

                          {activeRowMenuId === row.id ? (
                            <div className="absolute top-[calc(100%+6px)] right-0 z-20 min-w-[170px] rounded-lg border border-slate-200 bg-white p-1 shadow-lg dark:border-[#895af6]/20 dark:bg-[#0f0f15]">
                              <button
                                type="button"
                                onClick={() => {
                                  copyOrderId(row.id);
                                  setActiveRowMenuId(null);
                                }}
                                className="flex w-full items-center rounded-md px-2.5 py-2 text-left text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-[#895af6]/10"
                              >
                                Copy Order ID
                              </button>

                              {actionOptions.map((option) => (
                                <button
                                  key={option.action}
                                  type="button"
                                  disabled={isMutating}
                                  onClick={() => updateStatus(row.id, option.action)}
                                  className="flex w-full items-center rounded-md px-2.5 py-2 text-left text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-65 dark:text-slate-300 dark:hover:bg-[#895af6]/10"
                                >
                                  {option.label}
                                </button>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredRows.length === 0 ? (
            <div className="border-t border-slate-200 px-4 py-8 text-center text-sm text-slate-500 dark:border-[#895af6]/10 dark:text-slate-400">
              No orders match the selected filters.
            </div>
          ) : null}
        </div>
      </Reveal>
    </div>
  );
}
