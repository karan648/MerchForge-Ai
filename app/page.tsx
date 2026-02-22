import Link from "next/link";

export default function Home() {
  return (
    <>
      <nav className="fixed top-0 w-full z-50 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#895af6] rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xl">storm</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">MerchForge AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" href="#features">
              Features
            </a>
            <a className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" href="#solutions">
              Solutions
            </a>
            <a className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" href="#pricing">
              Pricing
            </a>
            <a className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" href="#resources">
              Resources
            </a>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-700 dark:text-white px-4 py-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-all"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="bg-[#895af6] hover:bg-[#895af6]/90 text-white text-sm font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg shadow-lg transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="bg-[#f6f5f8] dark:bg-[#0a0a0a]">
        <section className="relative pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#895af6]/20 via-transparent to-transparent -z-10 opacity-50" />
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#895af6]/10 border border-[#895af6]/20 text-[#895af6] text-xs font-bold mb-6 tracking-wider uppercase">
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              The Future of eCommerce
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight mb-6 sm:mb-8 leading-[1.1] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-500 dark:from-white dark:via-white dark:to-slate-400 bg-clip-text text-transparent">
              Everything you need to build a merch empire.
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed px-4">
              Turn ideas into professional merchandise with our all-in-one AI design, high-fidelity mockups, and automated sync platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
              <Link
                href="/register"
                className="w-full sm:w-auto bg-[#895af6] hover:bg-[#895af6]/90 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-bold shadow-xl flex items-center justify-center gap-2 group transition-all"
              >
                Start Creating for Free
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
              <button className="w-full sm:w-auto bg-white dark:bg-[#161616] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-900 dark:text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-bold transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">play_circle</span>
                Watch Demo
              </button>
            </div>
          </div>

          <div className="max-w-6xl mx-auto mt-12 sm:mt-20 relative px-4">
            <div className="relative rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white dark:bg-[#161616] shadow-2xl shadow-[#895af6]/10">
              <div className="h-10 border-b border-slate-200 dark:border-white/10 flex items-center px-4 gap-2 bg-slate-50 dark:bg-[#0a0a0a]/50">
                <div className="w-3 h-3 rounded-full bg-red-500/20" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                <div className="w-3 h-3 rounded-full bg-green-500/20" />
                <div className="ml-4 h-6 px-4 bg-slate-100 dark:bg-white/5 rounded-md flex items-center">
                  <span className="text-[10px] text-slate-500 font-mono">merchforge.ai/dashboard</span>
                </div>
              </div>
              <div className="aspect-video relative overflow-hidden bg-slate-100 dark:bg-[#161616]">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#895af6]/10 to-transparent" />
                <img
                  className="w-full h-full object-cover opacity-80"
                  alt="Dark UI dashboard showing creative design workflow"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0-zSI1o6kukOVugnaToQ6XZ35fOL-EMm8epXeYJqgTZNpsPi4jHmkeTiVsoBm7Ip5wKSvvLnZGv4lCNrMbNDXnkpaWuG6XHfOIwbQ-rZEcnaZqKGgb8TDqOzfn6bkImgXu53rWh22phTrg0YtZWzU0GvjUL-kLJxhZd94KA4nHG0eOkZajwRSZWWrCmvbH-aKfjulVg16fLogtCxV2Qtp-oyj2-PHjlxJ3I8c3ZkBbxp4uPPN0nNOoUqNjU5MQySW5sBCvwkuUlOX"
                />
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-white dark:from-[#0a0a0a] to-transparent" />
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
            <div className="md:col-span-7 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161616] p-6 sm:p-8 relative overflow-hidden group">
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-12 h-12 rounded-xl bg-[#895af6]/20 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[#895af6] text-2xl">draw</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-slate-900 dark:text-white">AI Design Generator</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md">Transform text prompts into high-resolution, production-ready graphics in seconds. Optimized specifically for apparel and physical goods.</p>
                <div className="mt-auto space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0a0a0a]/50 border border-slate-200 dark:border-white/10 flex items-center gap-4">
                    <span className="material-symbols-outlined text-[#895af6]">terminal</span>
                    <span className="text-sm font-mono text-slate-600 dark:text-slate-300 italic">&ldquo;Vintage 90s style synthwave mountain landscape...&rdquo;</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 h-2 bg-[#895af6]/20 rounded-full overflow-hidden">
                      <div className="h-full bg-[#895af6] w-2/3" />
                    </div>
                    <span className="text-[10px] uppercase font-bold text-[#895af6] tracking-widest">Generating Art</span>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 group-hover:opacity-20 transition-opacity">
                <img
                  className="w-full h-full object-cover"
                  alt="Abstract vibrant flowing purple and white liquid"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqCgj8Fq0YcO8KW0lCGu-DqvfFfwwSpYv8D3rrgILVbngUl3-lX0EFah75VZgOYfyJeTMOJQigngc5StAEikgppJXPrUmxwaoDjlDC8kPMJ23d4HtKmT5l9_nMzoNs63T0aDtFPk2IpZGyNt8K_Agzk4ezEg7Cra30AD75zAGtgvSaLUnlUwPArcZb_beQpxcO89RPkqBMXVu7-j8rcfXsx4oKioX2R3GJM0eun1dJo-PeBrFFqJSGJ9_QTMSqUyDGkUGJYCGEQC1G"
                />
              </div>
            </div>

            <div className="md:col-span-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161616] p-6 sm:p-8 relative overflow-hidden group">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-[#895af6]/20 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[#895af6] text-2xl">checkroom</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-slate-900 dark:text-white">Mockup Studio</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-8">Photorealistic 3D previews. See every stitch, texture, and light reflection on your products.</p>
              </div>
              <div className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-white/10">
                <img
                  className="w-full h-full object-cover"
                  alt="High quality white t-shirt hanging on a wooden wall"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAcLKLJgdD6NzcRlas-MWk0srZaEdeD0rCztE-eONAq4hdv_4duqb0LwO0Ftz4Qdqd2zhSWkY0rgzqm1n4cQhw563_sc8GO-29ZlZnwFD22H0e0t7mZc7A_-zxmY2eyBcS7cbkED0H5291th4B0BicyQzfDHwsB8OYdxiSFp0gKP3TCFZKv5K5hMxYuXZf1youCTDZawMFRmQKKrMB6W3EWkWFm2V1k1PbbnTXNr8zK0pUO0KGl5S7CgeSxdIn5ksz8c0FJ15t6OCzn"
                />
                <div className="absolute inset-0 bg-[#895af6]/10 mix-blend-overlay" />
                <div className="absolute bottom-4 left-4 right-4 p-3 bg-white/80 dark:bg-[#161616]/80 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-lg flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tighter">Premium Heavyweight Tee</span>
                  <div className="flex gap-1">
                    <div className="w-4 h-4 rounded-full bg-white border border-slate-300 dark:border-white/20" />
                    <div className="w-4 h-4 rounded-full bg-black border border-slate-300 dark:border-white/20" />
                    <div className="w-4 h-4 rounded-full bg-slate-500 border border-slate-300 dark:border-white/20" />
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161616] p-6 sm:p-8 group">
              <div className="w-12 h-12 rounded-xl bg-[#895af6]/20 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-[#895af6] text-2xl">sync_alt</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-slate-900 dark:text-white">Storefront Sync</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-8 sm:mb-10">Automate your fulfillment. Push designs to Shopify, Etsy, or TikTok Shop with a single click.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0a0a0a]/50 border border-slate-200 dark:border-white/10 flex items-center justify-center gap-3 grayscale hover:grayscale-0 transition-all cursor-pointer">
                  <span className="material-symbols-outlined text-slate-700 dark:text-white">shopping_bag</span>
                  <span className="font-bold text-slate-700 dark:text-white">Shopify</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0a0a0a]/50 border border-slate-200 dark:border-white/10 flex items-center justify-center gap-3 grayscale hover:grayscale-0 transition-all cursor-pointer">
                  <span className="material-symbols-outlined text-slate-700 dark:text-white">storefront</span>
                  <span className="font-bold text-slate-700 dark:text-white">Etsy</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0a0a0a]/50 border border-slate-200 dark:border-white/10 flex items-center justify-center gap-3 grayscale hover:grayscale-0 transition-all cursor-pointer col-span-2">
                  <span className="material-symbols-outlined text-slate-700 dark:text-white">bolt</span>
                  <span className="font-bold text-slate-700 dark:text-white">TikTok Shop</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-7 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161616] p-6 sm:p-8 relative overflow-hidden group">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8 sm:mb-10">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#895af6]/20 flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-[#895af6] text-2xl">query_stats</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-slate-900 dark:text-white">Advanced Analytics</h3>
                  <p className="text-slate-600 dark:text-slate-400 max-w-sm">Track sales, monitor best-selling designs, and optimize your profit margins with real-time data.</p>
                </div>
                <div className="hidden sm:block">
                  <div className="px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 rounded-lg text-sm font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">trending_up</span>
                    +24.8% Monthly ROI
                  </div>
                </div>
              </div>
              <div className="h-40 w-full relative">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 100">
                  <defs>
                    <linearGradient id="gradient" x1="0%" x2="0%" y1="0%" y2="100%">
                      <stop offset="0%" stopColor="#895af6" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#895af6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,80 Q50,90 100,50 T200,40 T300,70 T400,20 L400,100 L0,100 Z" fill="url(#gradient)" />
                  <path d="M0,80 Q50,90 100,50 T200,40 T300,70 T400,20" fill="none" stroke="#895af6" strokeWidth="2" />
                </svg>
                <div className="absolute inset-0 flex items-end justify-between px-2 pt-10">
                  <div className="text-[10px] text-slate-500 font-mono">Mon</div>
                  <div className="text-[10px] text-slate-500 font-mono">Tue</div>
                  <div className="text-[10px] text-slate-500 font-mono">Wed</div>
                  <div className="text-[10px] text-slate-500 font-mono">Thu</div>
                  <div className="text-[10px] text-slate-500 font-mono">Fri</div>
                  <div className="text-[10px] text-slate-500 font-mono">Sat</div>
                  <div className="text-[10px] text-slate-500 font-mono">Sun</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="solutions" className="py-16 sm:py-24 bg-white dark:bg-[#161616] border-y border-slate-200 dark:border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-20 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-slate-900 dark:text-white leading-tight">Scale your creative output without scaling your team.</h2>
              <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg mb-8 leading-relaxed">
                MerchForge AI combines professional-grade design tools with high-speed fulfillment automation. Whether you&apos;re a solo creator or a growing brand, we provide the infrastructure to dominate any niche.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-slate-700 dark:text-white">
                  <span className="material-symbols-outlined text-[#895af6]">verified</span>
                  <span>Vector-ready high resolution exports (4000px+)</span>
                </li>
                <li className="flex items-center gap-3 text-slate-700 dark:text-white">
                  <span className="material-symbols-outlined text-[#895af6]">verified</span>
                  <span>Automatic background removal for all designs</span>
                </li>
                <li className="flex items-center gap-3 text-slate-700 dark:text-white">
                  <span className="material-symbols-outlined text-[#895af6]">verified</span>
                  <span>Multi-product synchronization (Apparel, Mugs, Art)</span>
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="absolute -inset-10 bg-[#895af6]/10 rounded-full blur-[100px]" />
              <div className="relative grid grid-cols-2 gap-4">
                <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl translate-y-8">
                  <img
                    className="w-full h-auto"
                    alt="Close up of a premium t-shirt fabric texture"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCK4-ekSUcGJAFJgmaRw_4PF54dl0hNbaXQcy9lZ--7HyH9K1oL8lqrOy87qTtOOgsrui5YVwUSTpZHzrIKKBL8NJdLJAAIIZgv99_q0wxDtboB7wBXmCxhX4hMQhUnzgHFM5ZpnQYEM9Q4nkMR9GhHZGZUpVo2XqM5B8lgELBTqs589xf4MLREypCDYQpfq0OGI7h2wU-dxEHNLhRf0Mg9GQIPtWGMMXnJN2Pi6RGcSkkdaGaVKh4T3RVEN5QzHVV4adcPJTz4Uawc"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl">
                  <img
                    className="w-full h-auto"
                    alt="Streetwear photography of a model wearing a custom hoodie"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAvkBLm-UGzpsAOr2xf-409uN6dPWEzrYUPVHwbCboJT_esLJMcc_JCrN0srvGlXrvIevHk_vo5j42tcdxuri3KBLHGGO3Mum9k76-IsAA3QJWAIR1uDU1LNasmEq7QkYKdKg-xkfo3oc4VB8zmK4jE3PdFtiYvpjsjowT8asdF_Rf73-ejndDGMLU5pT7YhH4n4KruXhh77MlasUKcxvS5ZcP6e7Sy61Huem6fnzPl1HGWEaLT-eGBkh8_0iRafImhvUqHrqnPB5MN"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="py-20 sm:py-32 px-4 sm:px-6 relative overflow-hidden">
          <div className="max-w-4xl mx-auto text-center relative z-10 bg-white dark:bg-[#161616] rounded-[2rem] sm:rounded-[2.5rem] p-8 sm:p-12 md:p-20 border border-slate-200 dark:border-[#895af6]/20 shadow-2xl shadow-[#895af6]/10">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black mb-6 sm:mb-8 text-slate-900 dark:text-white leading-tight">Ready to forge your brand?</h2>
            <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg md:text-xl mb-8 sm:mb-12 max-w-2xl mx-auto">
              Join 10,000+ creators and brands who are building their merchandise empires with MerchForge AI.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto bg-[#895af6] hover:bg-[#895af6]/90 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-2xl text-lg sm:text-xl font-bold shadow-xl transition-all"
              >
                Get Started Now
              </Link>
              <Link
                href="#pricing"
                className="w-full sm:w-auto bg-slate-100 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/5 text-slate-900 dark:text-white px-8 sm:px-10 py-4 sm:py-5 rounded-2xl text-lg sm:text-xl font-bold transition-all"
              >
                View Pricing
              </Link>
            </div>
            <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500">star</span>
                <span className="font-bold">4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-500">security</span>
                <span className="font-bold">Secure Checkout</span>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[400px] bg-gradient-to-t from-[#895af6]/10 to-transparent -z-10" />
        </section>

        <section id="resources" className="py-16 sm:py-24 px-4 sm:px-6 bg-white dark:bg-[#161616]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-slate-900 dark:text-white">Resources to Help You Succeed</h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Everything you need to build and scale your merchandise business.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a]/50 hover:border-[#895af6]/50 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-[#895af6]/20 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[#895af6] text-2xl">menu_book</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Documentation</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">Comprehensive guides and tutorials to help you get the most out of MerchForge AI.</p>
                <a href="#" className="text-[#895af6] font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  Read Docs
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </a>
              </div>
              <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a]/50 hover:border-[#895af6]/50 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-[#895af6]/20 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[#895af6] text-2xl">school</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Help Center</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">Get answers to common questions and troubleshooting tips from our support team.</p>
                <a href="#" className="text-[#895af6] font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  Visit Help Center
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </a>
              </div>
              <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a]/50 hover:border-[#895af6]/50 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-[#895af6]/20 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[#895af6] text-2xl">article</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Blog</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">Tips, strategies, and success stories from creators building their merch empires.</p>
                <a href="#" className="text-[#895af6] font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  Read Blog
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#895af6] rounded flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[14px]">storm</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white uppercase tracking-widest text-sm">MerchForge AI</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 text-sm text-slate-600 dark:text-slate-500">
            <a className="hover:text-slate-900 dark:hover:text-white transition-colors" href="#">Twitter</a>
            <a className="hover:text-slate-900 dark:hover:text-white transition-colors" href="#">Discord</a>
            <a className="hover:text-slate-900 dark:hover:text-white transition-colors" href="#">Legal</a>
            <a className="hover:text-slate-900 dark:hover:text-white transition-colors" href="#">Privacy</a>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-600">© 2024 MerchForge AI. Built for the modern creator.</p>
        </div>
      </footer>
    </>
  );
}
