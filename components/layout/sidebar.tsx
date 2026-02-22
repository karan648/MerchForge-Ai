"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useDashboardNavState } from "@/components/layout/dashboard-nav-state";
import type { DashboardCurrentUser } from "@/components/layout/dashboard-shell";
import { ProjectLogo } from "@/components/ui/project-logo";
import { LogoutButton } from "@/components/ui/logout-button";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  dashboardPrimaryNav,
  dashboardSecondaryNav,
  isActiveRoute,
} from "@/features/navigation/dashboard-nav";
import { cn } from "@/lib/utils";

function resolveDisplayName(user: DashboardCurrentUser): string {
  const fullName = user.fullName?.trim();
  if (fullName) {
    return fullName;
  }

  return user.username;
}

function SidebarContent({
  currentUser,
  pathname,
  collapsed,
  mobile,
  onNavigate,
  onToggleCollapsed,
}: {
  currentUser: DashboardCurrentUser;
  pathname: string;
  collapsed: boolean;
  mobile: boolean;
  onNavigate?: () => void;
  onToggleCollapsed?: () => void;
}) {
  const displayName = resolveDisplayName(currentUser);
  const compact = collapsed && !mobile;

  return (
    <>
      <div className={cn("px-4 pt-4 pb-3", compact ? "px-2.5" : "px-5")}>
        <div className="mb-4 flex items-center justify-between gap-2">
          <ProjectLogo collapsed={compact} className={compact ? "justify-center" : ""} />

          {mobile ? (
            <button
              type="button"
              onClick={onNavigate}
              className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
              aria-label="Close sidebar"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onToggleCollapsed}
              className="hidden size-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 lg:inline-flex dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <span className="material-symbols-outlined text-[18px]">
                {collapsed ? "keyboard_double_arrow_right" : "keyboard_double_arrow_left"}
              </span>
            </button>
          )}
        </div>

        <Link
          href="/dashboard/generator"
          onClick={onNavigate}
          title="Create Design"
          className={cn(
            "mt-3 flex items-center gap-2 rounded-xl bg-[#895af6] text-white shadow-lg shadow-[#895af6]/25 transition-colors hover:bg-[#895af6]/90",
            compact ? "justify-center px-2 py-2.5" : "px-3 py-2.5",
          )}
        >
          <span className="material-symbols-outlined text-[20px]">add_box</span>
          {compact ? null : <span className="text-sm font-semibold">Create Design</span>}
        </Link>
      </div>

      <nav className="custom-scrollbar flex-1 space-y-1 overflow-y-auto px-3 pb-6">
        {compact ? null : (
          <p className="px-3 pb-1 text-[10px] font-bold tracking-[0.16em] text-slate-500 uppercase dark:text-slate-400">
            Workspace
          </p>
        )}

        {dashboardPrimaryNav.map((item, index) => {
          const isActive = isActiveRoute(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              title={item.label}
              className={cn(
                "group relative flex items-center rounded-lg border text-sm font-medium transition-all duration-200",
                compact ? "justify-center px-2 py-2.5" : "gap-3 px-3.5 py-2.5",
                isActive
                  ? "border-[#895af6]/30 bg-[#895af6]/12 text-[#895af6] dark:text-[#b59afc]"
                  : "border-transparent text-slate-600 hover:bg-[#895af6]/6 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100",
              )}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              {compact ? null : <span>{item.label}</span>}
              {isActive && !compact ? (
                <span className="absolute right-3 size-1.5 rounded-full bg-[#895af6]" />
              ) : null}
            </Link>
          );
        })}

        <div className="my-4 border-t border-slate-200 dark:border-white/10" />

        {compact ? null : (
          <p className="px-3 pb-1 text-[10px] font-bold tracking-[0.16em] text-slate-500 uppercase dark:text-slate-400">
            Account
          </p>
        )}

        {dashboardSecondaryNav.map((item) => {
          const isActive = isActiveRoute(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              title={item.label}
              className={cn(
                "group relative flex items-center rounded-lg border text-sm font-medium transition-all duration-200",
                compact ? "justify-center px-2 py-2.5" : "gap-3 px-3.5 py-2.5",
                isActive
                  ? "border-[#895af6]/30 bg-[#895af6]/12 text-[#895af6] dark:text-[#b59afc]"
                  : "border-transparent text-slate-600 hover:bg-[#895af6]/6 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100",
              )}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              {compact ? null : <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={cn("space-y-3 p-4", compact ? "px-2.5" : "px-5")}>
        <div
          className={cn(
            "rounded-xl border border-slate-200 bg-slate-100 dark:border-[#895af6]/20 dark:bg-[#895af6]/5",
            compact ? "p-3" : "p-4",
          )}
        >
          <div className="mb-2 flex items-center justify-between">
            {compact ? null : (
              <span className="text-[10px] font-semibold tracking-[0.14em] text-slate-500 uppercase dark:text-slate-400">
                Credits
              </span>
            )}
            <span className="text-xs font-bold text-[#895af6]">30%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-[#895af6]/15">
            <div className="h-full w-[30%] rounded-full bg-[#895af6] transition-all duration-500" />
          </div>
          {compact ? null : (
            <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">15 of 50 monthly generations left</p>
          )}
        </div>

        <div
          className={cn(
            "rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5",
            compact ? "p-2" : "p-3",
          )}
        >
          <Link
            href="/dashboard/profile"
            onClick={onNavigate}
            className={cn("flex items-center", compact ? "justify-center" : "gap-3")}
            title={displayName}
          >
            <UserAvatar
              fullName={currentUser.fullName}
              email={currentUser.email}
              avatarUrl={currentUser.avatarUrl}
              className="size-9 border border-[#895af6]/30 bg-[#895af6]/15"
              fallbackClassName="text-[11px]"
            />
            {compact ? null : (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{displayName}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{currentUser.email}</p>
              </div>
            )}
          </Link>

          {compact ? (
            <div className="mt-2 flex justify-center">
              <LogoutButton iconOnly />
            </div>
          ) : (
            <LogoutButton className="mt-3 w-full justify-center" />
          )}
        </div>
      </div>
    </>
  );
}

export function Sidebar({ currentUser }: { currentUser: DashboardCurrentUser }) {
  const pathname = usePathname();
  const {
    isSidebarCollapsed,
    isMobileNavOpen,
    closeMobileNav,
    toggleSidebarCollapsed,
  } = useDashboardNavState();

  return (
    <>
      <aside
        className={cn(
          "hidden h-screen shrink-0 border-r border-slate-200 bg-white transition-[width] duration-300 lg:flex lg:flex-col dark:border-[#895af6]/10 dark:bg-[#0f0f12]",
          isSidebarCollapsed ? "w-[92px]" : "w-64",
        )}
      >
        <SidebarContent
          currentUser={currentUser}
          pathname={pathname}
          collapsed={isSidebarCollapsed}
          mobile={false}
          onToggleCollapsed={toggleSidebarCollapsed}
        />
      </aside>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/55 transition-opacity duration-200 lg:hidden",
          isMobileNavOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={closeMobileNav}
      />

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-[300px] border-r border-slate-200 bg-white shadow-2xl transition-transform duration-200 lg:hidden dark:border-[#895af6]/10 dark:bg-[#0f0f12]",
          isMobileNavOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <SidebarContent
          currentUser={currentUser}
          pathname={pathname}
          collapsed={false}
          mobile
          onNavigate={closeMobileNav}
        />
      </aside>
    </>
  );
}
