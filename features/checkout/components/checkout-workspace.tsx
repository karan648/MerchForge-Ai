"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { createCheckoutOrderAction } from "../server/checkout-actions";
import type { CheckoutProductDetails } from "../server/checkout-service";

function formatCurrency(cents: number, currency: string): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency,
  });
}

export function CheckoutWorkspace({ product }: { product: CheckoutProductDetails }) {
  const shouldReduceMotion = useReducedMotion();
  const router = useRouter();
  const [isSubmitting, startSubmitting] = useTransition();

  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [shippingAddressLine1, setShippingAddressLine1] = useState("");
  const [shippingAddressLine2, setShippingAddressLine2] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingState, setShippingState] = useState("");
  const [shippingPostalCode, setShippingPostalCode] = useState("");
  const [shippingCountry, setShippingCountry] = useState("United States");
  const [quantity, setQuantity] = useState(1);

  const [error, setError] = useState<string | null>(null);

  const subtotal = product.priceCents * quantity;
  const total = subtotal;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startSubmitting(async () => {
      const result = await createCheckoutOrderAction({
        productId: product.id,
        buyerName,
        buyerEmail,
        quantity,
        shippingAddressLine1,
        shippingAddressLine2,
        shippingCity,
        shippingState,
        shippingPostalCode,
        shippingCountry,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.push(result.redirectPath);
      router.refresh();
    });
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:py-12">
      <motion.div
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32 }}
        className="mb-6"
      >
        <Link href={`/store/${product.sellerId}`} className="text-sm text-[#895af6] hover:underline">
          Back to @{product.sellerUsername}
        </Link>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">Secure Checkout</h1>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <motion.form
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.04 }}
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/70"
        >
          <section className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-1 md:col-span-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Full Name</span>
              <input
                value={buyerName}
                onChange={(event) => setBuyerName(event.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#895af6] dark:border-zinc-800 dark:bg-zinc-900 dark:text-slate-100"
              />
            </label>

            <label className="grid gap-1 md:col-span-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Email</span>
              <input
                type="email"
                value={buyerEmail}
                onChange={(event) => setBuyerEmail(event.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#895af6] dark:border-zinc-800 dark:bg-zinc-900 dark:text-slate-100"
              />
            </label>

            <label className="grid gap-1 md:col-span-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Address Line 1</span>
              <input
                value={shippingAddressLine1}
                onChange={(event) => setShippingAddressLine1(event.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#895af6] dark:border-zinc-800 dark:bg-zinc-900 dark:text-slate-100"
              />
            </label>

            <label className="grid gap-1 md:col-span-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Address Line 2 (optional)</span>
              <input
                value={shippingAddressLine2}
                onChange={(event) => setShippingAddressLine2(event.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#895af6] dark:border-zinc-800 dark:bg-zinc-900 dark:text-slate-100"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">City</span>
              <input
                value={shippingCity}
                onChange={(event) => setShippingCity(event.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#895af6] dark:border-zinc-800 dark:bg-zinc-900 dark:text-slate-100"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">State</span>
              <input
                value={shippingState}
                onChange={(event) => setShippingState(event.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#895af6] dark:border-zinc-800 dark:bg-zinc-900 dark:text-slate-100"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Postal Code</span>
              <input
                value={shippingPostalCode}
                onChange={(event) => setShippingPostalCode(event.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#895af6] dark:border-zinc-800 dark:bg-zinc-900 dark:text-slate-100"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Country</span>
              <input
                value={shippingCountry}
                onChange={(event) => setShippingCountry(event.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#895af6] dark:border-zinc-800 dark:bg-zinc-900 dark:text-slate-100"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Quantity</span>
              <input
                type="number"
                min={1}
                max={10}
                value={quantity}
                onChange={(event) => setQuantity(Math.max(1, Math.min(10, Number(event.target.value) || 1)))}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#895af6] dark:border-zinc-800 dark:bg-zinc-900 dark:text-slate-100"
              />
            </label>
          </section>

          {error ? (
            <p className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#895af6] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#895af6]/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span className="material-symbols-outlined text-[18px]">lock</span>
            {isSubmitting ? "Placing Order..." : "Place Order"}
          </button>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            This checkout is operating in test mode while Stripe integration is finalized.
          </p>
        </motion.form>

        <motion.aside
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="h-fit space-y-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/70"
        >
          <img src={product.imageUrl} alt={product.title} className="aspect-square w-full rounded-xl object-cover" />

          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{product.title}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{product.description}</p>
          </div>

          <div className="space-y-2 border-t border-slate-200 pt-4 dark:border-zinc-800">
            <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
              <span>Unit Price</span>
              <span>{formatCurrency(product.priceCents, product.currency)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
              <span>Quantity</span>
              <span>{quantity}</span>
            </div>
            <div className="flex items-center justify-between text-base font-bold text-slate-900 dark:text-slate-100">
              <span>Total</span>
              <span>{formatCurrency(total, product.currency)}</span>
            </div>
          </div>
        </motion.aside>
      </div>
    </div>
  );
}
