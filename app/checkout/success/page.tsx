import Link from "next/link";

type CheckoutSuccessPageProps = {
  searchParams: Promise<{
    order?: string;
  }>;
};

export default async function CheckoutSuccessPage({ searchParams }: CheckoutSuccessPageProps) {
  const { order } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center px-4 py-12">
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900/70">
        <span className="mx-auto mb-4 inline-flex size-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
          <span className="material-symbols-outlined text-3xl">check_circle</span>
        </span>

        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
          Order Confirmed
        </h1>

        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          Thanks for your purchase. Your order has been received and will appear in your dashboard.
        </p>

        {order ? (
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Order ID: <span className="font-semibold text-[#895af6]">{order}</span>
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/dashboard/orders"
            className="rounded-lg bg-[#895af6] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#895af6]/90"
          >
            View Orders
          </Link>
          <Link
            href="/dashboard/storefront"
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-slate-200"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
