"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FormEvent, useState } from "react";

import { ThemeToggleButton } from "@/components/ui/theme-toggle-button";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!acceptTerms) {
      setError("You need to accept the terms and privacy policy.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
      });

      const payload = (await response.json()) as {
        error?: string;
        requiresEmailConfirmation?: boolean;
      };

      if (!response.ok) {
        setError(payload.error ?? "Unable to create account.");
        return;
      }

      if (payload.requiresEmailConfirmation) {
        setSuccess("Account created. Please confirm your email before signing in.");
        setTimeout(() => router.push("/login?registered=1"), 1200);
        return;
      }

      router.push("/onboarding");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f6f5f8] dark:bg-[#09090b]">
      <header className="fixed top-0 z-50 flex w-full items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#895af6] shadow-lg shadow-[#895af6]/20">
            <span className="material-symbols-outlined text-xl text-white">auto_awesome</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            MerchForge <span className="text-[#895af6]">AI</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggleButton />
          <Link
            href="/help"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-[#895af6] dark:text-slate-400"
          >
            Help &amp; Support
          </Link>
        </div>
      </header>

      <main className="mb-8 mt-16 flex flex-1 items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[460px] rounded-xl border border-slate-200 bg-white/90 p-8 shadow-2xl backdrop-blur-xl md:p-10 dark:border-white/[0.05] dark:bg-[#18181b]/80"
        >
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Create an account
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Join the future of AI-powered merchandise design.
            </p>
          </div>

          <div className="mb-8 grid grid-cols-2 gap-4">
            <button
              type="button"
              className="flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 transition-all hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
            >
              <img
                alt="Google Logo"
                className="h-5 w-5"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2Fq8I5TLAXzfcEmFxUrYDoHeDlGgoXvUCpr0ahPDnCEapU6vpYO9o5cFO6L-PZD1O0ybw1xDms-yhx8yKZRBugfBGNxE3hrgdst1L0pVCB_d5kj9JeI14vMwbDQ1_lxFRAbHpLAXzc8TxtlQcG7eLzMXv_f7uqoIswV8eKOylRrpWf4mVnS-b-10u9yZDWyk-j0-_jahcXn5xDBXSEwEwI4QUQgsdip6FyRqCaUG7ljFIexUvLv7kvGnt_bZWAO2eCymHRrofqyQU"
              />
              Google
            </button>
            <button
              type="button"
              className="flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 transition-all hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
            >
              <span className="material-symbols-outlined text-xl">ios</span>
              Apple
            </button>
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-slate-500 dark:bg-[#18181b]">Or continue with email</span>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="full-name">
                Full Name
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-lg text-slate-400">
                  person
                </span>
                <input
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pr-4 pl-10 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-[#895af6] dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:placeholder:text-slate-600"
                  id="full-name"
                  placeholder="John Doe"
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-lg text-slate-400">
                  mail
                </span>
                <input
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pr-4 pl-10 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-[#895af6] dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:placeholder:text-slate-600"
                  id="email"
                  placeholder="name@company.com"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-lg text-slate-400">
                  lock
                </span>
                <input
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pr-12 pl-10 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-[#895af6] dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:placeholder:text-slate-600"
                  id="password"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
            </div>
            <div className="flex items-start gap-3 py-1">
              <div className="flex h-5 items-center">
                <input
                  className="h-4 w-4 rounded border-slate-300 bg-white text-[#895af6] focus:ring-[#895af6] focus:ring-offset-white dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-offset-zinc-900"
                  id="terms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(event) => setAcceptTerms(event.target.checked)}
                />
              </div>
              <label className="text-sm leading-tight text-slate-600 dark:text-slate-400" htmlFor="terms">
                I agree to the{" "}
                <Link href="/terms" className="text-[#895af6] hover:underline">
                  Terms and Conditions
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-[#895af6] hover:underline">
                  Privacy Policy
                </Link>
                .
              </label>
            </div>

            {error ? (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            ) : null}

            {success ? (
              <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                {success}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#895af6] font-bold text-white shadow-lg shadow-[#895af6]/20 transition-all hover:bg-[#895af6]/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span>{isSubmitting ? "Creating account..." : "Get Started"}</span>
              <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">
                arrow_forward
              </span>
            </button>
          </form>

          <div className="mt-8 text-center text-sm">
            <p className="text-slate-600 dark:text-slate-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-[#895af6] decoration-2 underline-offset-4 hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>
        </motion.div>
      </main>

      <footer className="w-full py-8 text-center">
        <div className="mb-4 flex justify-center gap-8">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-500">
            <span className="material-symbols-outlined text-sm">verified_user</span>
            Secure 256-bit SSL Encryption
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-500">
            <span className="material-symbols-outlined text-sm">cloud_done</span>
            Automated Cloud Backup
          </div>
        </div>
        <p className="text-[10px] font-medium tracking-widest text-slate-500 uppercase dark:text-zinc-600">
          © 2024 MerchForge AI. All rights reserved.
        </p>
      </footer>

      <div className="pointer-events-none fixed top-[-10%] right-[-10%] -z-10 h-[40%] w-[40%] rounded-full bg-[#895af6]/5 blur-[120px]" />
      <div className="pointer-events-none fixed bottom-[-10%] left-[-10%] -z-10 h-[40%] w-[40%] rounded-full bg-[#895af6]/10 blur-[120px]" />
    </div>
  );
}
