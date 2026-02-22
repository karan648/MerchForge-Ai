import Link from "next/link";
import { redirect } from "next/navigation";

import { Reveal } from "@/components/ui/reveal";
import { getDashboardOverview } from "@/features/dashboard/server/dashboard-overview";
import { getOnboardingSession } from "@/features/onboarding/server/onboarding-service";

type StatCard = {
  label: string;
  value: string;
  badge: string;
  badgeClassName: string;
  icon: string;
  iconWrapperClassName: string;
};

type DesignCard = {
  id: string;
  title: string;
  generatedAt: string;
  status: "Live" | "Draft";
  imageUrl: string;
};

const FALLBACK_DESIGN_CARDS: DesignCard[] = [
  {
    id: "fallback-1",
    title: "Minimalist Peak T-Shirt",
    generatedAt: "Generated 2 hours ago",
    status: "Live",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBHWG0wdCj5G73wCyvDWcZeIK-dXbSIv9xfmovnxoUJipPFaDIr3Qn1bLS6GJqN6Mh1XrGfx2dETZLF2ypYYFwh1aUo_DcYtjeqndWnqmR_S99E9BVxKBlCHOGrBeQLab9qoo7VG99oRC-NMKRHxD0CdlgV2_f6j0WzstL77w5TnH2DY6xHtHDKIF_1j2wSxeaMUxPekOuROV6CvWerX3hgsimkNCluqO-yWozXTfu3POl2Vjs9Jip9XRea_LivRW7kecyJByHwTBwv",
  },
  {
    id: "fallback-2",
    title: "Neon Cyberpunk Hoodie",
    generatedAt: "Generated 5 hours ago",
    status: "Draft",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBO_IAbq8HMp5Tq-s9XlAVVN4k0PuD5Q_fp1uKtFb0P6-cBh9Z1M0WCmYYgE0haxqtp4os5xcOV8lPqgVD6zlcy78FaF2-Mm9IyDEKysm90vFdVSuw1ykQcd7AiOncjbStyBybOhezuz2DToVp0hG4HD15A5YDR_D9Zr-y9bP6HjgonHvONDww5mK1Hf9jou4tl7wbXfuOseafYP2BGBGlD-MJQRp3K3FJ9u_BnJyAkKsJOZxSWh-5rRx4RCz3D_qwW7FdjFfsU4aPW",
  },
  {
    id: "fallback-3",
    title: "Botanical Sketch Tee",
    generatedAt: "Generated Yesterday",
    status: "Live",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDm6t8pw5AyDD_9i1Qif47Er_X9o-lYCOpwbWWolefF9wskSW7_-mlEbfv_REeuThccsfa3oYipg-pk1OCyJHt8GZW4LOPPHZf7UP0zCYY9rUJlAW7b2oKWA0uTui7_EuxMMMz1NPn8LKHhvXIa2fZeFIr9fFsIS0wT3Zvx90qsmkpu76NqVbdtUM0MHeDEwHrJ2IAdM-BNjTZjhiVQlluRC3Vfy6jrGoX_DsvKALjN-s-SMT7_muxJ8fP8FTTUFuUFJOTOp78nPu_I",
  },
];

function formatRelativeTime(date: Date): string {
  const elapsedMs = Date.now() - date.getTime();
  const elapsedMinutes = Math.floor(elapsedMs / (1000 * 60));

  if (elapsedMinutes < 1) {
    return "Generated just now";
  }

  if (elapsedMinutes < 60) {
    return `Generated ${elapsedMinutes} minute${elapsedMinutes === 1 ? "" : "s"} ago`;
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) {
    return `Generated ${elapsedHours} hour${elapsedHours === 1 ? "" : "s"} ago`;
  }

  const elapsedDays = Math.floor(elapsedHours / 24);
  if (elapsedDays < 7) {
    return `Generated ${elapsedDays} day${elapsedDays === 1 ? "" : "s"} ago`;
  }

  return `Generated on ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

function trendBadgeClassName(tone: "positive" | "neutral" | "warning"): string {
  if (tone === "positive") {
    return "text-green-500 bg-green-500/10";
  }

  if (tone === "warning") {
    return "text-orange-500 bg-orange-500/10";
  }

  return "text-slate-500 bg-slate-500/10 dark:text-slate-300 dark:bg-slate-300/10";
}

export default async function DashboardPage() {
  const session = await getOnboardingSession();

  if (!session) {
    redirect("/login");
  }

  const overview = await getDashboardOverview(session.id, session.fullName);
  const recentDesignCards: DesignCard[] =
    overview.recentDesigns.length > 0
      ? overview.recentDesigns.map((design, index) => ({
          id: design.id,
          title: design.title,
          generatedAt: formatRelativeTime(design.generatedAt),
          status: design.status,
          imageUrl: design.imageUrl ?? FALLBACK_DESIGN_CARDS[index % FALLBACK_DESIGN_CARDS.length].imageUrl,
        }))
      : FALLBACK_DESIGN_CARDS;

  const statCards: StatCard[] = [
    {
      label: "Total Sales",
      value: overview.totalSalesFormatted,
      badge: overview.totalSalesTrend.label,
      badgeClassName: trendBadgeClassName(overview.totalSalesTrend.tone),
      icon: "monetization_on",
      iconWrapperClassName: "bg-green-500/10 text-green-500",
    },
    {
      label: "Generated Designs",
      value: overview.generatedDesignsCount.toLocaleString("en-US"),
      badge: overview.generatedDesignsTrend.label,
      badgeClassName: trendBadgeClassName(overview.generatedDesignsTrend.tone),
      icon: "draw",
      iconWrapperClassName: "bg-[#895af6]/10 text-[#895af6]",
    },
    {
      label: "Credits Remaining",
      value: `${overview.creditsRemaining} / ${overview.creditsLimit}`,
      badge: overview.creditsTrend.label,
      badgeClassName: trendBadgeClassName(overview.creditsTrend.tone),
      icon: "token",
      iconWrapperClassName: "bg-orange-500/10 text-orange-500",
    },
  ];

  return (
    <div className="custom-scrollbar flex h-full flex-col overflow-y-auto">
      <div className="space-y-8 p-4 md:p-8">
        <Reveal>
          <section className="relative flex flex-col items-center justify-between gap-6 overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 md:flex-row dark:border-[#895af6]/20 dark:bg-[#895af6]/10">
            <div className="relative z-10">
              <h2 className="mb-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Welcome back, {overview.greetingName}.
              </h2>
              <p className="max-w-md text-slate-600 dark:text-slate-400">
                Your design workflow is optimized. Ready to create your next bestseller using our updated
                AI engine?
              </p>
              <div className="mt-6 flex gap-3">
                <Link
                  href="/dashboard/generator"
                  className="flex items-center gap-2 rounded-lg bg-[#895af6] px-5 py-2.5 font-semibold text-white transition-all hover:bg-[#895af6]/90"
                >
                  <span className="material-symbols-outlined text-sm">rocket_launch</span>
                  Start Generating
                </Link>
                <Link
                  href="/dashboard/billing"
                  className="rounded-lg border border-slate-200 bg-slate-100 px-5 py-2.5 font-semibold text-slate-700 transition-all hover:bg-slate-200 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                >
                  View Plan
                </Link>
              </div>
            </div>
            <div className="pointer-events-none absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-[#895af6]/15 to-transparent" />
            <div className="animate-float-slow pointer-events-none absolute -top-20 -right-20 z-10 size-40 rounded-full bg-[#895af6]/10 blur-3xl md:size-56 dark:bg-[#895af6]/20" />
          </section>
        </Reveal>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {statCards.map((card, index) => (
            <Reveal
              key={card.label}
              delayMs={index * 70}
              className="card-hover rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-[#895af6]/40 dark:border-[#895af6]/10 dark:bg-[#895af6]/5"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className={`size-10 rounded-lg flex items-center justify-center ${card.iconWrapperClassName}`}>
                  <span className="material-symbols-outlined">{card.icon}</span>
                </div>
                <span className={`rounded px-2 py-0.5 text-xs font-bold ${card.badgeClassName}`}>{card.badge}</span>
              </div>
              <p className="mb-1 text-sm font-medium text-slate-500 dark:text-slate-400">{card.label}</p>
              <h3 className="text-2xl font-bold tracking-tight">{card.value}</h3>
            </Reveal>
          ))}
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">Recent Designs</h2>
            <Link href="/dashboard/designs" className="text-sm font-semibold text-[#895af6] hover:underline">
              View All Gallery
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/dashboard/generator"
              className="group relative flex h-[320px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 transition-all hover:border-[#895af6] hover:bg-[#895af6]/5 dark:border-[#895af6]/20"
            >
              <div className="flex size-14 items-center justify-center rounded-full bg-[#895af6]/10 text-[#895af6] transition-transform group-hover:scale-110">
                <span className="material-symbols-outlined text-3xl">add</span>
              </div>
              <span className="mt-4 font-bold text-slate-700 group-hover:text-[#895af6] dark:text-slate-300">
                Create New Design
              </span>
              <p className="mt-1 text-xs text-slate-500">Start with AI prompt</p>
            </Link>

            {recentDesignCards.map((design) => (
              <article
                key={design.id}
                className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:shadow-xl dark:border-[#895af6]/10 dark:bg-[#895af6]/5 dark:hover:shadow-[#895af6]/5"
              >
                <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-[#895af6]/10">
                  <div className="absolute top-3 left-3 z-10">
                    <span
                      className={`rounded px-2 py-1 text-[10px] font-bold text-white uppercase ${
                        design.status === "Live" ? "bg-green-500" : "bg-slate-500"
                      }`}
                    >
                      {design.status}
                    </span>
                  </div>
                  <img
                    alt={design.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    src={design.imageUrl}
                  />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <Link
                      href="/dashboard/designs"
                      className="flex size-10 items-center justify-center rounded-full bg-white text-slate-900 transition-colors hover:bg-[#895af6] hover:text-white"
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </Link>
                    <Link
                      href="/dashboard/mockups"
                      className="flex size-10 items-center justify-center rounded-full bg-white text-slate-900 transition-colors hover:bg-[#895af6] hover:text-white"
                    >
                      <span className="material-symbols-outlined">visibility</span>
                    </Link>
                  </div>
                </div>
                <div className="flex-1 p-4">
                  <h4 className="truncate text-sm font-bold">{design.title}</h4>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{design.generatedAt}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <footer className="mt-auto flex flex-col items-center justify-between gap-4 border-t border-slate-200 p-8 text-slate-500 dark:border-[#895af6]/10 dark:text-slate-400 sm:flex-row">
        <p className="text-xs">© 2024 MerchForge AI Engine v2.4. Powered by Forge Intelligence.</p>
        <div className="flex gap-6 text-xs font-medium">
          <Link href="#" className="transition-colors hover:text-[#895af6]">
            Documentation
          </Link>
          <Link href="#" className="transition-colors hover:text-[#895af6]">
            API Status
          </Link>
          <Link href="#" className="transition-colors hover:text-[#895af6]">
            Terms of Service
          </Link>
        </div>
      </footer>
    </div>
  );
}
