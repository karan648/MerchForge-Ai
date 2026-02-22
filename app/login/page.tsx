"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FormEvent, useEffect, useState } from "react";

import { ThemeToggleButton } from "@/components/ui/theme-toggle-button";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nextPath, setNextPath] = useState("/dashboard");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNextPath(params.get("next") || "/dashboard");
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const payload = (await response.json()) as {
        error?: string;
        user?: {
          onboardingCompleted?: boolean;
        };
      };

      if (!response.ok) {
        setError(payload.error ?? "Unable to sign in.");
        return;
      }

      const destination =
        payload.user?.onboardingCompleted === false
          ? "/onboarding"
          : nextPath;

      router.push(destination);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f6f5f8] dark:bg-[#09090b]">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(137,90,246,0.13),transparent_70%)]" />

      <nav className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-8 py-8">
        <Link href="/" className="group flex cursor-pointer items-center gap-2">
          <div className="size-8 rounded-lg bg-[#895af6] text-white shadow-lg shadow-[#895af6]/20">
            <span className="material-symbols-outlined grid size-full place-items-center text-xl">
              auto_awesome
            </span>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            MerchForge <span className="text-[#895af6]">AI</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggleButton />
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 transition-colors duration-200 hover:text-[#895af6] dark:text-slate-500"
          >
            Back to website
          </Link>
        </div>
      </nav>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[420px]"
        >
          <div className="rounded-xl border border-slate-200 bg-white/90 p-8 shadow-2xl backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#141414]/80">
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Welcome back</h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Enter your credentials to access your workspace
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="ml-1 mb-2 block text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                  Email Address
                </label>
                <input
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-[#895af6] focus:ring-1 focus:ring-[#895af6] dark:border-[#262626] dark:bg-[#0a0a0a]/50 dark:text-white dark:placeholder:text-slate-600"
                  placeholder="name@company.com"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <div className="ml-1 mb-2 flex items-center justify-between">
                  <label className="block text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-[#895af6] transition-colors hover:text-[#895af6]/80"
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-[#895af6] focus:ring-1 focus:ring-[#895af6] dark:border-[#262626] dark:bg-[#0a0a0a]/50 dark:text-white dark:placeholder:text-slate-600"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              {error ? (
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#895af6] py-3.5 font-semibold text-white shadow-lg shadow-[#895af6]/20 transition-all duration-200 active:scale-[0.98] hover:bg-[#895af6]/90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Signing In..." : "Sign In"}
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-[#262626]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 font-medium text-slate-500 dark:bg-[#141414]">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2.5 transition-colors duration-200 hover:bg-slate-100 dark:border-[#262626] dark:bg-transparent dark:hover:bg-white/5"
              >
                <img
                  alt="Google logo"
                  className="h-4 w-4"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAttXYppfj8arlHSrRjxndvZ0nu6fQB7u-pBSVI-iAqavj07Hkohb9NGoLQHWTS6IjOeg5pwByiIFCJzey6OMjyg1oaby1BlMTxO6JaF8GtybSfZ_mAd-wXgL_-gnFlcFtSHTGQ-_Vom5lBD3mB2-Ng-9levVJB9kCtuHLKJ8E9DzqukgHZlp2TUskLwxCXYC-u0nMYGoVcmfa5SoULA6e39IUwT6ckACRigD-1F1RPASyGnqqSNVuIHeiq_r6U0kSQluOXEQqxXqk5"
                />
                <span className="text-sm font-medium text-slate-800 dark:text-white">Google</span>
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2.5 transition-colors duration-200 hover:bg-slate-100 dark:border-[#262626] dark:bg-transparent dark:hover:bg-white/5"
              >
                <span className="material-symbols-outlined text-lg text-slate-800 dark:text-white">ios</span>
                <span className="text-sm font-medium text-slate-800 dark:text-white">Apple</span>
              </button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="ml-1 font-semibold text-[#895af6] underline-offset-4 transition-all hover:underline"
                >
                  Sign up for free
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-6">
            <Link
              href="/privacy"
              className="text-xs text-slate-500 transition-colors hover:text-slate-700 dark:hover:text-slate-300"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-slate-500 transition-colors hover:text-slate-700 dark:hover:text-slate-300"
            >
              Terms of Service
            </Link>
            <Link
              href="/help"
              className="text-xs text-slate-500 transition-colors hover:text-slate-700 dark:hover:text-slate-300"
            >
              Help Center
            </Link>
          </div>
        </motion.div>
      </main>

      <footer className="relative z-10 w-full p-8 text-center">
        <p className="text-xs text-slate-500 dark:text-slate-600">
          © 2024 MerchForge AI Inc. Powered by advanced design intelligence.
        </p>
      </footer>
    </div>
  );
}
