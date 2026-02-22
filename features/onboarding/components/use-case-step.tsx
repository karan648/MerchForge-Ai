"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useTransition } from "react";

import { saveUseCaseAction } from "@/features/onboarding/server/onboarding-actions";

import type { OnboardingUseCase } from "../types";

type UseCaseStepProps = {
  initialUseCase: OnboardingUseCase;
};

export function UseCaseStep({ initialUseCase }: UseCaseStepProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [useCase, setUseCase] = useState<OnboardingUseCase>(initialUseCase);
  const [error, setError] = useState<string | null>(null);

  async function saveUseCaseWithFallback(value: OnboardingUseCase) {
    try {
      const actionResult = await saveUseCaseAction(value);
      if (actionResult.ok) {
        return actionResult;
      }
    } catch {
      // Fall back to API route when server action transport fails in local dev.
    }

    const response = await fetch("/api/onboarding/use-case", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ useCase: value }),
    });

    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    if (!response.ok) {
      return { ok: false as const, error: payload?.error ?? "Unable to save use case." };
    }

    return { ok: true as const };
  }

  function handleContinue() {
    setError(null);

    startTransition(async () => {
      const result = await saveUseCaseWithFallback(useCase);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.push("/onboarding/experience");
      router.refresh();
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#151022]">
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-[#895af6]/20 bg-white/[0.02] backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-3xl text-[#895af6]">auto_awesome</span>
          <h2 className="text-xl font-bold tracking-tight text-white">MerchForge</h2>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="flex items-center justify-center p-2 rounded-full hover:bg-[#895af6]/20 transition-colors"
          >
            <span className="material-symbols-outlined text-slate-400">help_outline</span>
          </button>
          <div className="h-8 w-8 rounded-full bg-[#895af6]/20 flex items-center justify-center text-[#895af6] border border-[#895af6]/30">
            <span className="material-symbols-outlined text-sm">person</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl w-full"
        >
          <div className="bg-slate-900/40 border border-[#895af6]/10 rounded-xl shadow-2xl overflow-hidden backdrop-blur-sm">
            <div className="px-8 pt-8 pb-4">
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#895af6]">
                  Step 1 of 4
                </span>
                <span className="text-xs font-medium text-slate-400">25% Complete</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-[#895af6] rounded-full transition-all duration-500" style={{ width: "25%" }} />
              </div>
            </div>

            <div className="px-8 py-6 text-center">
              <h1 className="text-3xl font-bold text-white mb-2 leading-tight">How will you use MerchForge?</h1>
              <p className="text-slate-400">Tailor your experience by selecting the path that fits you best.</p>
            </div>

            <div className="px-8 py-4 grid gap-4">
              <label className="relative cursor-pointer group">
                <input
                  type="radio"
                  name="usage"
                  className="sr-only"
                  checked={useCase === "PERSONAL"}
                  onChange={() => setUseCase("PERSONAL")}
                />
                <div
                  className={`card-content flex items-center p-5 rounded-lg border-2 transition-all duration-200 ${
                    useCase === "PERSONAL"
                      ? "border-[#895af6] bg-[#895af6]/10"
                      : "border-slate-800 bg-slate-900/20 hover:border-[#895af6]/50"
                  }`}
                >
                  <div
                    className={`size-12 rounded-lg flex items-center justify-center mr-5 group-hover:scale-110 transition-transform ${
                      useCase === "PERSONAL" ? "bg-[#895af6]/20 text-[#895af6]" : "bg-[#895af6]/10 text-[#895af6]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-2xl">person</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-white">Personal</h3>
                    <p className="text-sm text-slate-400">Just for me and my private projects</p>
                  </div>
                  <div
                    className={`size-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      useCase === "PERSONAL" ? "bg-[#895af6] border-[#895af6]" : "border-slate-700"
                    }`}
                  >
                    {useCase === "PERSONAL" ? (
                      <span className="material-symbols-outlined text-sm text-white">check</span>
                    ) : null}
                  </div>
                </div>
              </label>

              <label className="relative cursor-pointer group">
                <input
                  type="radio"
                  name="usage"
                  className="sr-only"
                  checked={useCase === "BUSINESS"}
                  onChange={() => setUseCase("BUSINESS")}
                />
                <div
                  className={`card-content flex items-center p-5 rounded-lg border-2 transition-all duration-200 ${
                    useCase === "BUSINESS"
                      ? "border-[#895af6] bg-[#895af6]/10"
                      : "border-slate-800 bg-slate-900/20 hover:border-[#895af6]/50"
                  }`}
                >
                  <div
                    className={`size-12 rounded-lg flex items-center justify-center mr-5 group-hover:scale-110 transition-transform ${
                      useCase === "BUSINESS" ? "bg-[#895af6]/20 text-[#895af6]" : "bg-[#895af6]/10 text-[#895af6]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-2xl">storefront</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-white">Business</h3>
                    <p className="text-sm text-slate-400">Growing my brand and selling products</p>
                  </div>
                  <div
                    className={`size-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      useCase === "BUSINESS" ? "bg-[#895af6] border-[#895af6]" : "border-slate-700"
                    }`}
                  >
                    {useCase === "BUSINESS" ? (
                      <span className="material-symbols-outlined text-sm text-white">check</span>
                    ) : null}
                  </div>
                </div>
              </label>

              <label className="relative cursor-pointer group">
                <input
                  type="radio"
                  name="usage"
                  className="sr-only"
                  checked={useCase === "AGENCY"}
                  onChange={() => setUseCase("AGENCY")}
                />
                <div
                  className={`card-content flex items-center p-5 rounded-lg border-2 transition-all duration-200 ${
                    useCase === "AGENCY"
                      ? "border-[#895af6] bg-[#895af6]/10"
                      : "border-slate-800 bg-slate-900/20 hover:border-[#895af6]/50"
                  }`}
                >
                  <div
                    className={`size-12 rounded-lg flex items-center justify-center mr-5 group-hover:scale-110 transition-transform ${
                      useCase === "AGENCY" ? "bg-[#895af6]/20 text-[#895af6]" : "bg-[#895af6]/10 text-[#895af6]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-2xl">hub</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-white">Agency</h3>
                    <p className="text-sm text-slate-400">Managing stores for multiple clients</p>
                  </div>
                  <div
                    className={`size-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      useCase === "AGENCY" ? "bg-[#895af6] border-[#895af6]" : "border-slate-700"
                    }`}
                  >
                    {useCase === "AGENCY" ? (
                      <span className="material-symbols-outlined text-sm text-white">check</span>
                    ) : null}
                  </div>
                </div>
              </label>
            </div>

            {error ? (
              <p className="px-8 text-sm text-red-300">{error}</p>
            ) : null}

            <div className="px-8 py-8 flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/dashboard"
                className="w-full sm:w-1/3 py-3 rounded-lg font-semibold text-slate-400 hover:bg-slate-800 transition-colors text-center"
              >
                Go Back
              </Link>
              <button
                type="button"
                onClick={handleContinue}
                disabled={isPending}
                className="w-full sm:w-2/3 py-3 rounded-lg bg-[#895af6] hover:bg-[#895af6]/90 text-white font-bold shadow-lg shadow-[#895af6]/20 transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isPending ? "Saving..." : "Next Step"}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-6 text-xs text-slate-600 font-medium">
            <Link href="/privacy" className="hover:text-[#895af6] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-[#895af6] transition-colors">
              Terms of Service
            </Link>
            <Link href="/help" className="hover:text-[#895af6] transition-colors">
              Contact Support
            </Link>
          </div>
        </motion.div>
      </main>

      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#895af6]/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#895af6]/10 blur-[120px] rounded-full pointer-events-none -z-10" />
    </div>
  );
}
