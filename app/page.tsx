import Link from "next/link";

export default function Home() {
  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-neutral-800 bg-white/85 dark:bg-black/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#895af6]">
              <span className="material-symbols-outlined text-xl text-white">
                auto_awesome
              </span>
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              MerchForge AI
            </span>
          </div>

          <div className="hidden items-center gap-10 md:flex">
            <Link
              className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors hover:text-[#895af6]"
              href="/features"
            >
              Features
            </Link>
            <a
              className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors hover:text-[#895af6]"
              href="#pricing"
            >
              Pricing
            </a>
            <a
              className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors hover:text-[#895af6]"
              href="#showcase"
            >
              Showcase
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="px-5 py-2.5 text-sm font-bold text-slate-900 dark:text-slate-100 transition-colors hover:text-slate-900 dark:hover:text-white"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-[#895af6] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#895af6]/20 transition-all hover:bg-[#895af6]/90"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="relative flex h-[calc(100vh-5rem)] min-h-[700px] items-center overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source src="/banner.mp4" type="video/mp4" />
          </video>
          
          <div className="absolute inset-0 bg-black/70" />
          
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(137,90,246,0.15)_0%,transparent_70%)]" />
          
          <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center gap-8 px-6 text-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#895af6]/30 bg-[#895af6]/10 px-3 py-1 text-xs font-bold tracking-[0.2em] text-[#895af6] uppercase">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#895af6] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#895af6]" />
              </span>
              Next-Gen Merch Engine
            </div>

            <h1 className="text-5xl font-black tracking-tight text-white md:text-7xl">
              Design Merch with <span className="text-[#895af6]">AI.</span> Sell Anywhere.
            </h1>

            <p className="max-w-xl text-xl leading-relaxed text-slate-200">
              The all-in-one platform to generate unique designs, create stunning mockups, 
              and sync to your favorite stores in seconds. No design skills required.
            </p>

            <div className="mt-4 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/register"
                className="group flex items-center gap-2 rounded-xl bg-[#895af6] px-8 py-4 text-lg font-bold text-white shadow-[0_0_20px_rgba(137,90,246,0.3)] transition-all hover:bg-[#895af6]/90"
              >
                Get Started Free
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <button className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-8 py-4 text-lg font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20">
                <span className="material-symbols-outlined">play_circle</span>
                See How It Works
              </button>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-slate-300">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#895af6]">check_circle</span>
                No credit card required
              </span>
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#895af6]">check_circle</span>
                14-day free trial
              </span>
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#895af6]">check_circle</span>
                Cancel anytime
              </span>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <span className="material-symbols-outlined text-white/50">keyboard_arrow_down</span>
          </div>
        </section>

        <section className="border-b border-slate-200 dark:border-neutral-800 bg-slate-100/70 dark:bg-neutral-900/20 py-32">
          <div className="mx-auto w-full max-w-7xl px-6">
            <div className="mb-20 flex flex-col items-center text-center">
              <h2 className="mb-6 text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100 md:text-5xl">
                Built for Scaling Creators
              </h2>
              <p className="max-w-2xl text-lg text-slate-600 dark:text-slate-400">
                Skip the design agency and the complex software. MerchForge
                gives you the tools to go from idea to storefront in minutes.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <div className="group rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 p-8 transition-all hover:border-[#895af6]/50">
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-xl border border-[#895af6]/20 bg-[#895af6]/10 transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-3xl text-[#895af6]">
                    psychology
                  </span>
                </div>
                <h3 className="mb-4 text-2xl font-bold text-slate-900 dark:text-slate-100">
                  AI Generator
                </h3>
                <p className="leading-relaxed text-slate-600 dark:text-slate-400">
                  Text-to-vector engine built specifically for high-quality
                  apparel designs. Generate scalable graphics that look
                  professional on any garment.
                </p>
              </div>

              <div className="group rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 p-8 transition-all hover:border-[#895af6]/50">
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-xl border border-[#895af6]/20 bg-[#895af6]/10 transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-3xl text-[#895af6]">
                    view_in_ar
                  </span>
                </div>
                <h3 className="mb-4 text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Mockup Studio
                </h3>
                <p className="leading-relaxed text-slate-600 dark:text-slate-400">
                  Drag-and-drop your designs onto premium 4K garment templates.
                  Lighting, shadows, and fabric textures are applied
                  automatically.
                </p>
              </div>

              <div className="group rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 p-8 transition-all hover:border-[#895af6]/50">
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-xl border border-[#895af6]/20 bg-[#895af6]/10 transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-3xl text-[#895af6]">
                    sync
                  </span>
                </div>
                <h3 className="mb-4 text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Storefront Sync
                </h3>
                <p className="leading-relaxed text-slate-600 dark:text-slate-400">
                  One-click export and automatic sync to Shopify, Printful, and
                  Etsy. We handle the heavy lifting of product creation and
                  syncing.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-32">
          <div className="mx-auto w-full max-w-7xl px-6">
            <div className="mb-20 flex flex-col items-end justify-between gap-8 md:flex-row">
              <div className="max-w-2xl">
                <h2 className="mb-6 text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100 md:text-5xl">
                  From Prompt to Profit
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-400">
                  A streamlined workflow designed to help you launch collections
                  faster than ever before.
                </p>
              </div>
              <div className="pb-2">
                <span className="select-none text-8xl font-black text-[#895af6]/10">
                  PROCESS
                </span>
              </div>
            </div>

            <div className="grid overflow-hidden rounded-3xl border border-slate-200 dark:border-neutral-800 md:grid-cols-3">
              <div className="group relative overflow-hidden border-r border-slate-200 dark:border-neutral-800 bg-slate-100/70 dark:bg-neutral-900/20 p-12">
                <span className="absolute -top-4 -right-4 text-9xl font-black text-white/5 transition-colors group-hover:text-[#895af6]/10">
                  1
                </span>
                <div className="relative z-10">
                  <h4 className="mb-6 text-sm font-bold tracking-[0.2em] text-[#895af6] uppercase">
                    Step One
                  </h4>
                  <h3 className="mb-4 text-3xl font-bold text-slate-900 dark:text-slate-100">
                    Generate
                  </h3>
                  <p className="leading-relaxed text-slate-600 dark:text-slate-400">
                    Prompt our specialized AI for unique artistic styles, logos,
                    or illustrations tailored for printing.
                  </p>
                </div>
              </div>

              <div className="group relative overflow-hidden border-r border-slate-200 dark:border-neutral-800 bg-slate-100/70 dark:bg-neutral-900/20 p-12">
                <span className="absolute -top-4 -right-4 text-9xl font-black text-white/5 transition-colors group-hover:text-[#895af6]/10">
                  2
                </span>
                <div className="relative z-10">
                  <h4 className="mb-6 text-sm font-bold tracking-[0.2em] text-[#895af6] uppercase">
                    Step Two
                  </h4>
                  <h3 className="mb-4 text-3xl font-bold text-slate-900 dark:text-slate-100">
                    Customize
                  </h3>
                  <p className="leading-relaxed text-slate-600 dark:text-slate-400">
                    Apply your artwork to a catalog of premium blanks. Adjust
                    placement, scale, and colors instantly.
                  </p>
                </div>
              </div>

              <div className="group relative overflow-hidden bg-slate-100/70 dark:bg-neutral-900/20 p-12">
                <span className="absolute -top-4 -right-4 text-9xl font-black text-white/5 transition-colors group-hover:text-[#895af6]/10">
                  3
                </span>
                <div className="relative z-10">
                  <h4 className="mb-6 text-sm font-bold tracking-[0.2em] text-[#895af6] uppercase">
                    Step Three
                  </h4>
                  <h3 className="mb-4 text-3xl font-bold text-slate-900 dark:text-slate-100">Sell</h3>
                  <p className="leading-relaxed text-slate-600 dark:text-slate-400">
                    Push to your store. Orders are fulfilled automatically by
                    our network of global print partners.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="px-6 py-32">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[3rem] bg-[#895af6] p-12 text-center md:p-24">
            <div
              className="pointer-events-none absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                backgroundSize: "40px 40px",
              }}
            />
            <div className="relative z-10">
              <h2 className="mb-8 text-4xl font-black tracking-tight text-white md:text-6xl">
                Ready to launch your brand?
              </h2>
              <p className="mx-auto mb-12 max-w-2xl text-xl text-white/80">
                Join thousands of creators who are using AI to build profitable
                merchandise businesses.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-xl border-none bg-white px-6 py-4 font-medium text-slate-900 focus:ring-4 focus:ring-black/20 sm:w-80"
                />
                <Link
                  href="/register"
                  className="w-full rounded-xl bg-black px-10 py-4 text-lg font-black text-white shadow-2xl transition-colors hover:bg-neutral-900 sm:w-auto"
                >
                  Get Started Free
                </Link>
              </div>
              <p className="mt-8 text-sm font-medium text-white/60">
                No credit card required. Cancel anytime.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 dark:border-neutral-800 py-20">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="mb-6 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-[#895af6]">
                <span className="material-symbols-outlined text-sm text-white">
                  auto_awesome
                </span>
              </div>
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-slate-100">
                MerchForge AI
              </span>
            </div>
            <p className="mb-6 text-sm leading-relaxed text-slate-600 dark:text-slate-500">
              Empowering the next generation of e-commerce creators with
              generative artificial intelligence.
            </p>
            <div className="flex gap-4">
              <a
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 dark:border-neutral-800 text-slate-600 dark:text-slate-400 transition-all hover:border-[#895af6] hover:text-[#895af6]"
                href="#"
              >
                <span className="material-symbols-outlined text-xl">
                  language
                </span>
              </a>
              <a
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 dark:border-neutral-800 text-slate-600 dark:text-slate-400 transition-all hover:border-[#895af6] hover:text-[#895af6]"
                href="#"
              >
                <span className="material-symbols-outlined text-xl">public</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-6 font-bold text-slate-900 dark:text-slate-100">Product</h4>
            <ul className="flex flex-col gap-4 text-sm text-slate-600 dark:text-slate-500">
              <li>
                <Link className="transition-colors hover:text-[#895af6]" href="/features">
                  Features
                </Link>
              </li>
              <li>
                <a className="transition-colors hover:text-[#895af6]" href="#">
                  Mockup Studio
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-[#895af6]" href="#">
                  Pricing
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-[#895af6]" href="#">
                  Integrations
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 font-bold text-slate-900 dark:text-slate-100">Resources</h4>
            <ul className="flex flex-col gap-4 text-sm text-slate-600 dark:text-slate-500">
              <li>
                <a className="transition-colors hover:text-[#895af6]" href="#">
                  Documentation
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-[#895af6]" href="#">
                  Help Center
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-[#895af6]" href="#">
                  API Reference
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-[#895af6]" href="#">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 font-bold text-slate-900 dark:text-slate-100">Company</h4>
            <ul className="flex flex-col gap-4 text-sm text-slate-600 dark:text-slate-500">
              <li>
                <a className="transition-colors hover:text-[#895af6]" href="#">
                  About Us
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-[#895af6]" href="#">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-[#895af6]" href="#">
                  Terms of Service
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-[#895af6]" href="#">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mx-auto mt-20 flex w-full max-w-7xl flex-col items-center justify-between gap-6 border-t border-slate-200 dark:border-neutral-800 px-6 pt-10 md:flex-row">
          <p className="text-xs text-slate-600">
            © 2024 MerchForge AI Inc. All rights reserved.
          </p>
          <div className="flex gap-8">
            <a
              className="text-xs font-medium text-slate-600 dark:text-slate-400 transition-colors hover:text-slate-900 dark:hover:text-slate-300"
              href="#"
            >
              Twitter
            </a>
            <a
              className="text-xs font-medium text-slate-600 dark:text-slate-400 transition-colors hover:text-slate-900 dark:hover:text-slate-300"
              href="#"
            >
              Instagram
            </a>
            <a
              className="text-xs font-medium text-slate-600 dark:text-slate-400 transition-colors hover:text-slate-900 dark:hover:text-slate-300"
              href="#"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
