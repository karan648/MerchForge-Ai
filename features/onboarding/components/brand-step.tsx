"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useTransition } from "react";

import { saveBrandAction } from "@/features/onboarding/server/onboarding-actions";

type BrandStepProps = {
  initialBrandName: string;
  initialLogoUrl: string | null;
};

export function BrandStep({ initialBrandName, initialLogoUrl }: BrandStepProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [brandName, setBrandName] = useState(initialBrandName);
  const [logoPreview, setLogoPreview] = useState<string | null>(initialLogoUrl);
  const [error, setError] = useState<string | null>(null);

  async function saveBrandWithFallback(input: { brandName: string; logoUrl: string | null }) {
    try {
      const actionResult = await saveBrandAction(input);
      if (actionResult.ok) {
        return actionResult;
      }
    } catch {
      // Fall back to API route when server action transport fails in local dev.
    }

    const response = await fetch("/api/onboarding/brand", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });

    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    if (!response.ok) {
      return { ok: false as const, error: payload?.error ?? "Unable to save brand details." };
    }

    return { ok: true as const };
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  function handleContinue() {
    setError(null);

    startTransition(async () => {
      const result = await saveBrandWithFallback({
        brandName,
        logoUrl: logoPreview,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.push("/onboarding/finished");
      router.refresh();
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0c]">
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#895af6]/10 bg-white/[0.02] backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-[#895af6] p-1.5 rounded-lg flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-2xl">rocket_launch</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">Store Builder</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-slate-400 font-medium">Signed in workspace</p>
            <p className="text-sm font-semibold text-white">MerchForge AI</p>
          </div>
          <div className="size-10 rounded-full border-2 border-[#895af6]/20 p-0.5 overflow-hidden">
            <img
              alt="User Profile"
              className="w-full h-full object-cover rounded-full"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFsJSFe__sezh1-JdlMWJZh769Hdrp7JSOal_CXdCcVqy18TYUBnJsieH-XwEtKw7fUWaZZGBD7Y-h1rEBOzIpQZsodf1EPD4eNJe31PSDZdia0kIRJ99WdAFRefKVq0ykVzVHEqgqIn3CL15wue3hnryjPNDr759CjRfeCqlP9mvICAl6Gj3uOsJRm90Hi-uvVfyihmQlc_NtJikN-AhO74swlzlMEmK2ah8ybSdZwMVdZ7XefH_MnMa8FJvNYUEU5dsBrOoSNmrt"
            />
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-xl"
        >
          <div className="mb-10">
            <div className="flex justify-between items-end mb-4">
              <div>
                <span className="px-3 py-1 rounded-full bg-[#895af6]/10 text-[#895af6] text-xs font-bold uppercase tracking-wider">
                  Step 3 of 4
                </span>
                <h1 className="text-3xl font-black mt-3 tracking-tight text-white">Let&apos;s start with your brand.</h1>
              </div>
              <p className="text-[#895af6] font-bold text-lg">75%</p>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-[#895af6] rounded-full transition-all duration-500" style={{ width: "75%" }} />
            </div>
            <p className="mt-4 text-slate-400 leading-relaxed text-lg">
              Give your merch store a name and identity to stand out from the crowd.
            </p>
          </div>

          <div className="bg-[#151022] rounded-xl border border-[#895af6]/10 shadow-2xl shadow-[#895af6]/5 p-8">
            <div className="space-y-8">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300 ml-1" htmlFor="brand-name">
                  Brand Name
                </label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#895af6] transition-colors">
                    storefront
                  </span>
                  <input
                    id="brand-name"
                    type="text"
                    value={brandName}
                    onChange={(event) => setBrandName(event.target.value)}
                    className="w-full bg-[#0a0a0c]/50 border border-slate-800 rounded-lg py-4 pl-12 pr-4 text-lg focus:ring-2 focus:ring-[#895af6]/20 focus:border-[#895af6] outline-none transition-all placeholder:text-slate-600 text-white"
                    placeholder="e.g. Neon Nights"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300 ml-1">Logo Upload</label>
                <div className="relative">
                  <input
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml"
                    onChange={handleLogoUpload}
                  />
                  <div className="border-2 border-dashed border-slate-800 rounded-xl p-10 flex flex-col items-center justify-center gap-4 bg-[#0a0a0c]/30 hover:bg-[#895af6]/5 hover:border-[#895af6]/50 transition-all group">
                    {logoPreview ? (
                      <div className="relative">
                        <img src={logoPreview} alt="Logo preview" className="w-20 h-20 object-contain rounded-lg" />
                        <button
                          type="button"
                          onClick={(event) => {
                            event.preventDefault();
                            setLogoPreview(null);
                          }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-sm text-white">close</span>
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="size-16 rounded-full bg-[#895af6]/10 flex items-center justify-center text-[#895af6] group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-4xl">cloud_upload</span>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-white">
                            Drag and drop or <span className="text-[#895af6] hover:underline">browse</span>
                          </p>
                          <p className="text-sm text-slate-500 mt-1">Supports PNG, JPG, SVG (Max 5MB)</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {error ? <p className="text-sm text-red-300">{error}</p> : null}

              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={isPending}
                  className="w-full bg-[#895af6] hover:bg-[#895af6]/90 text-white font-bold py-4 px-6 rounded-lg text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#895af6]/20 hover:shadow-[#895af6]/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isPending ? "Saving..." : "Next Step"}
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
                <Link
                  href="/onboarding/finished"
                  className="w-full mt-4 text-slate-500 hover:text-slate-200 font-medium py-2 text-sm transition-colors text-center block"
                >
                  Skip for now
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-8 opacity-40 grayscale">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-white">shield</span>
              <span className="text-xs font-bold uppercase tracking-widest text-white">Secure Data</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-white">verified</span>
              <span className="text-xs font-bold uppercase tracking-widest text-white">Premium Tools</span>
            </div>
          </div>
        </motion.div>
      </main>

      <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#895af6]/10 blur-[120px] rounded-full -z-10" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-[#895af6]/5 blur-[100px] rounded-full -z-10" />
    </div>
  );
}
