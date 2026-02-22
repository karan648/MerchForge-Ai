import Link from "next/link";

export default function Home() {
  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-white/10 bg-white/85 dark:bg-[#151022]/80 backdrop-blur-md px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-[#895af6] p-1.5 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-xl">
              apparel
            </span>
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
            MerchForge <span className="text-[#895af6]">AI</span>
          </span>
        </div>
        <Link
          href="/register"
          className="bg-[#895af6] hover:bg-[#895af6]/90 text-white px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
        >
          Get Started
        </Link>
      </nav>

      <main className="relative overflow-hidden">
        <section className="relative pt-12 pb-8 px-6 text-center bg-[radial-gradient(circle_at_50%_50%,rgba(137,90,246,0.15)_0%,rgba(21,16,34,0)_70%)]">
          <div className="max-w-md mx-auto">
            <span className="inline-block px-3 py-1 rounded-full bg-[#895af6]/10 text-[#895af6] text-xs font-bold tracking-widest uppercase mb-4">
              The Future of Apparel
            </span>
            <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-4 text-slate-900 dark:text-white">
              Design Merch with AI. <br />
              <span className="text-[#895af6]">Sell Anywhere.</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed mb-8">
              Transform ideas into high-quality apparel designs in seconds. Powered by advanced AI for creators and entrepreneurs.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/register"
                className="bg-[#895af6] text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-[#895af6]/20 hover:scale-[1.02] active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2"
              >
                Start Creating
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <button className="bg-white/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all">
                View Demo
              </button>
            </div>
          </div>
        </section>

        <section className="px-4 py-8">
          <div className="relative max-w-lg mx-auto aspect-[4/5] rounded-xl overflow-hidden bg-white/3 dark:bg-white/5 backdrop-blur-md border border-white/10 dark:border-white/10 p-2">
            <div
              className="relative h-full w-full rounded-xl border border-slate-200 dark:border-white/10 bg-cover bg-center shadow-2xl"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDa2NLpicS_5_kkfR3xC66NVRSWDzsHR3XtT5gNMZlrc44HG1HZPGglScV1lF8ZmT-Md1yFoO0kzhRRIZ1t1Jac8_L9_ZM88MxnygHaT-VwCYiD1JI6BxJArTevP8m1jeX9LhMnjKPNjHOxpcw-6x-eY4zlz-zVcAjFsph0NxlgS7BtSFNhIpNZwsxImMpitx9O_14RZRzOMZJN-Pzx31MXJefL97mE46HyKRVzXtHa4FUpuTJwgZP3AN-KDgFIInXJKBjwJBFCCoU5')",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-3 bg-white/10 dark:bg-white/10 backdrop-blur-md p-3 rounded-lg border border-white/20">
                  <div className="size-10 rounded bg-[#895af6]/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#895af6]">auto_awesome</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-300">Generated Graphic</p>
                    <p className="text-sm font-bold text-white">&quot;Cyberpunk Tiger Illustration&quot;</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-12">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Everything you need to launch</h2>
            <p className="text-slate-600 dark:text-slate-400">From prompt to product, we handle the heavy lifting.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
            <div className="bg-white/5 dark:bg-white/5 backdrop-blur-md p-6 rounded-xl flex flex-col items-start gap-4 border border-white/10 dark:border-white/10">
              <div className="size-12 rounded-lg bg-[#895af6]/10 flex items-center justify-center border border-[#895af6]/20">
                <span className="material-symbols-outlined text-[#895af6] text-2xl">neurology</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">AI Generator</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Generate unique, production-ready artwork from simple text prompts instantly. No design skills required.
                </p>
              </div>
            </div>

            <div className="bg-white/5 dark:bg-white/5 backdrop-blur-md p-6 rounded-xl flex flex-col items-start gap-4 border border-white/10 dark:border-white/10">
              <div className="size-12 rounded-lg bg-[#895af6]/10 flex items-center justify-center border border-[#895af6]/20">
                <span className="material-symbols-outlined text-[#895af6] text-2xl">layers</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Mockup Studio</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Instant high-fidelity product previews on premium apparel styles with realistic textures and shadows.
                </p>
              </div>
            </div>

            <div className="bg-white/5 dark:bg-white/5 backdrop-blur-md p-6 rounded-xl flex flex-col items-start gap-4 border border-white/10 dark:border-white/10">
              <div className="size-12 rounded-lg bg-[#895af6]/10 flex items-center justify-center border border-[#895af6]/20">
                <span className="material-symbols-outlined text-[#895af6] text-2xl">storefront</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Storefront Sync</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Sync and sell your designs on global marketplaces like Shopify, Etsy, and Amazon with one click.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-16 text-center">
          <div className="bg-[#895af6] p-8 rounded-xl shadow-2xl shadow-[#895af6]/20">
            <h2 className="text-2xl font-black text-white mb-4 leading-tight">Ready to start your merch empire?</h2>
            <p className="text-white/80 mb-8 max-w-xs mx-auto">Join 10,000+ creators launching brands with AI today.</p>
            <Link
              href="/register"
              className="block w-full bg-white text-[#895af6] px-6 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 transition-colors text-center"
            >
              Create My First Design
            </Link>
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/85 dark:bg-[#151022]/80 backdrop-blur-md border-t border-slate-200 dark:border-white/10 px-4 pb-6 pt-2 md:hidden">
        <div className="flex items-center justify-around">
          <Link href="/" className="flex flex-col items-center gap-1 text-[#895af6]">
            <span className="material-symbols-outlined">home</span>
            <span className="text-[10px] font-bold">Home</span>
          </Link>
          <Link href="/dashboard/generator" className="flex flex-col items-center gap-1 text-slate-400">
            <span className="material-symbols-outlined">add_circle</span>
            <span className="text-[10px] font-bold">Create</span>
          </Link>
          <Link href="/dashboard/mockups" className="flex flex-col items-center gap-1 text-slate-400">
            <span className="material-symbols-outlined">palette</span>
            <span className="text-[10px] font-bold">Studio</span>
          </Link>
          <Link href="/dashboard" className="flex flex-col items-center gap-1 text-slate-400">
            <span className="material-symbols-outlined">account_circle</span>
            <span className="text-[10px] font-bold">Account</span>
          </Link>
        </div>
      </div>

      <div className="h-24 md:hidden"></div>
    </>
  );
}
