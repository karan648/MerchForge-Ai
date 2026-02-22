"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { dashboardPrimaryNav, isActiveRoute } from "@/features/navigation/dashboard-nav";
import { cn } from "@/lib/utils";

export function MobileDashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="custom-scrollbar border-b border-slate-200 bg-white px-3 py-2 lg:hidden dark:border-white/10 dark:bg-[#0b0b0d]">
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {dashboardPrimaryNav.map((item) => {
          const isActive = isActiveRoute(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                isActive
                  ? "border-[#895af6]/45 bg-[#895af6]/18 text-[#b699fb]"
                  : "border-slate-200 bg-slate-100 text-slate-700 dark:border-white/12 dark:bg-white/5 dark:text-slate-300",
              )}
            >
              <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
