"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useTransition } from "react";

import { saveExperienceAction } from "@/features/onboarding/server/onboarding-actions";

import type { OnboardingExperience } from "../types";

type ExperienceStepProps = {
  initialExperience: OnboardingExperience;
};

export function ExperienceStep({ initialExperience }: ExperienceStepProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [experience, setExperience] = useState<OnboardingExperience>(initialExperience);
  const [error, setError] = useState<string | null>(null);

  async function saveExperienceWithFallback(value: OnboardingExperience) {
    try {
      const actionResult = await saveExperienceAction(value);
      if (actionResult.ok) {
        return actionResult;
      }
    } catch {
      // Fall back to API route when server action transport fails in local dev.
    }

    const response = await fetch("/api/onboarding/experience", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ experienceLevel: value }),
    });

    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    if (!response.ok) {
      return { ok: false as const, error: payload?.error ?? "Unable to save experience level." };
    }

    return { ok: true as const };
  }

  function handleContinue() {
    setError(null);

    startTransition(async () => {
      const result = await saveExperienceWithFallback(experience);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.push("/onboarding/brand");
      router.refresh();
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#151022]">
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-[#895af6]/20 bg-white/[0.02] backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-[#895af6] p-2 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-xl">auto_awesome</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Onboarding</h1>
        </div>
        <Link href="/" className="p-2 hover:bg-[#895af6]/20 rounded-full transition-colors">
          <span className="material-symbols-outlined text-slate-400">close</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-md w-full flex flex-col gap-8"
        >
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#895af6]">Step 2 of 4</span>
                <h2 className="text-2xl font-bold mt-1 text-white">Experience Level</h2>
              </div>
              <span className="text-sm font-medium text-slate-400">50% Complete</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-[#895af6] rounded-full transition-all duration-500" style={{ width: "50%" }} />
            </div>
          </div>

          <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl p-8 shadow-2xl border border-white/[0.1] space-y-8">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2 text-white">Tell us about your design experience</h3>
              <p className="text-slate-400 text-sm">Help us tailor the AI engine to your skill level.</p>
            </div>

            <div className="space-y-4">
              <label className="relative block cursor-pointer group">
                <input
                  type="radio"
                  name="experience"
                  className="peer sr-only"
                  checked={experience === "BEGINNER"}
                  onChange={() => setExperience("BEGINNER")}
                />
                <div
                  className={`flex items-center gap-4 p-5 rounded-xl border-2 transition-all duration-200 ${
                    experience === "BEGINNER"
                      ? "border-[#895af6] bg-[#895af6]/10"
                      : "border-slate-800 bg-slate-900/50 hover:border-[#895af6]/50"
                  }`}
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#895af6]/10 flex items-center justify-center text-[#895af6]">
                    <span className="material-symbols-outlined">school</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-white">Beginner</p>
                    <p className="text-sm text-slate-400 leading-snug">New to AI and merch design</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      experience === "BEGINNER" ? "border-[#895af6] bg-[#895af6]" : "border-slate-700"
                    }`}
                  >
                    {experience === "BEGINNER" ? <div className="w-2 h-2 rounded-full bg-white" /> : null}
                  </div>
                </div>
              </label>

              <label className="relative block cursor-pointer group">
                <input
                  type="radio"
                  name="experience"
                  className="peer sr-only"
                  checked={experience === "ADVANCED"}
                  onChange={() => setExperience("ADVANCED")}
                />
                <div
                  className={`flex items-center gap-4 p-5 rounded-xl border-2 transition-all duration-200 ${
                    experience === "ADVANCED"
                      ? "border-[#895af6] bg-[#895af6]/10"
                      : "border-slate-800 bg-slate-900/50 hover:border-[#895af6]/50"
                  }`}
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#895af6]/10 flex items-center justify-center text-[#895af6]">
                    <span className="material-symbols-outlined">rocket_launch</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-white">Advanced</p>
                    <p className="text-sm text-slate-400 leading-snug">Experienced creator or designer</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      experience === "ADVANCED" ? "border-[#895af6] bg-[#895af6]" : "border-slate-700"
                    }`}
                  >
                    {experience === "ADVANCED" ? <div className="w-2 h-2 rounded-full bg-white" /> : null}
                  </div>
                </div>
              </label>
            </div>

            {error ? <p className="text-sm text-red-300">{error}</p> : null}

            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={handleContinue}
                disabled={isPending}
                className="w-full py-4 bg-[#895af6] hover:bg-[#895af6]/90 text-white font-bold rounded-xl shadow-lg shadow-[#895af6]/25 transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span>{isPending ? "Saving..." : "Next Step"}</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
              <Link
                href="/onboarding/use-case"
                className="w-full py-2 text-slate-400 hover:text-[#895af6] transition-colors text-sm font-medium text-center"
              >
                Go Back
              </Link>
            </div>
          </div>

          <div className="text-center px-4">
            <p className="text-xs text-slate-500 italic">
              &ldquo;This helps us optimize your creative workflow and asset generation speed.&rdquo;
            </p>
          </div>
        </motion.div>
      </main>

      <div className="fixed bottom-6 right-6">
        <button className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-xl border border-white/10 backdrop-blur-md">
          <span className="material-symbols-outlined">help_outline</span>
        </button>
      </div>
    </div>
  );
}
