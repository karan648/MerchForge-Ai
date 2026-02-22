"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useTransition } from "react";

import { completeOnboardingAction } from "@/features/onboarding/server/onboarding-actions";

type FinishedStepProps = {
  firstName: string;
};

export function FinishedStep({ firstName }: FinishedStepProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function completeOnboardingWithFallback() {
    try {
      const actionResult = await completeOnboardingAction();
      if (actionResult.ok) {
        return actionResult;
      }
    } catch {
      // Fall back to API route when server action transport fails in local dev.
    }

    const response = await fetch("/api/onboarding/complete", {
      method: "POST",
    });

    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    if (!response.ok) {
      return { ok: false as const, error: payload?.error ?? "Unable to complete onboarding." };
    }

    return { ok: true as const };
  }

  function handleGoToDashboard() {
    setError(null);

    startTransition(async () => {
      const result = await completeOnboardingWithFallback();

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#151022]">
      <header className="w-full flex items-center justify-between px-6 py-4 border-b border-[#895af6]/10 bg-white/[0.02] backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-[#895af6] p-2 rounded-lg">
            <span className="material-symbols-outlined text-white text-xl">rocket_launch</span>
          </div>
          <h2 className="text-lg font-bold tracking-tight text-white">Onboarding</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[#895af6]/10 border border-[#895af6]/20">
            <span className="w-2 h-2 rounded-full bg-[#895af6] animate-pulse" />
            <span className="text-xs font-medium text-[#895af6] uppercase tracking-wider">Step 4 of 4</span>
          </div>
          <button type="button" className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <span className="material-symbols-outlined text-slate-400">close</span>
          </button>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#895af6]/15 rounded-full pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#895af6]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#895af6]/10 rounded-full blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white/[0.03] backdrop-blur-xl max-w-md w-full rounded-xl p-8 md:p-12 text-center shadow-2xl relative z-10 border border-white/[0.08]"
        >
          <div className="relative mb-8 inline-block">
            <div className="absolute inset-0 bg-[#895af6]/20 blur-2xl rounded-full" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-[#895af6] to-[#895af6]/60 rounded-full flex items-center justify-center shadow-lg shadow-[#895af6]/20">
              <span className="material-symbols-outlined text-white text-5xl font-light">task_alt</span>
            </div>
            <div className="absolute -top-2 -right-2 bg-yellow-400 w-4 h-4 rounded-full blur-[1px]" />
            <div className="absolute bottom-2 -left-4 bg-[#895af6] w-3 h-3 rounded-full blur-[1px]" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">You&apos;re all set, {firstName}!</h1>
          <p className="text-slate-400 text-lg leading-relaxed mb-10">
            Your workspace is ready. Let&apos;s start designing your first bestseller.
          </p>

          <div className="mb-10 p-4 rounded-lg bg-white/5 border border-white/5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-400 uppercase tracking-widest">Setup Status</span>
              <span className="text-sm font-bold text-[#895af6]">100% Complete</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-[#895af6] w-full rounded-full" />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={handleGoToDashboard}
              disabled={isPending}
              className="w-full bg-[#895af6] hover:bg-[#895af6]/90 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-xl shadow-[#895af6]/20 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPending ? "Finishing..." : "Go to Dashboard"}
              <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </button>
            <button className="w-full bg-transparent hover:bg-white/5 text-slate-400 font-medium py-3 px-6 rounded-lg transition-colors">
              View setup summary
            </button>
          </div>

          {error ? (
            <p className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          ) : null}
        </motion.div>
      </main>

      <footer className="p-6 text-center">
        <p className="text-slate-500 text-xs tracking-wide">
          Need help?{" "}
          <Link href="/help" className="text-[#895af6] hover:underline font-medium">
            Contact Support
          </Link>{" "}
          or{" "}
          <Link href="/tutorials" className="text-[#895af6] hover:underline font-medium">
            View Tutorials
          </Link>
        </p>
      </footer>
    </div>
  );
}
