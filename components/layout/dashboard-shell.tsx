import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardNavProvider } from "@/components/layout/dashboard-nav-state";
import { MobileDashboardNav } from "@/components/layout/mobile-dashboard-nav";
import { Sidebar } from "@/components/layout/sidebar";

export type DashboardCurrentUser = {
  fullName: string | null;
  email: string;
  username: string;
  avatarUrl: string | null;
};

export function DashboardShell({
  children,
  currentUser,
}: {
  children: React.ReactNode;
  currentUser: DashboardCurrentUser;
}) {
  return (
    <DashboardNavProvider>
      <div className="flex min-h-screen bg-[#f6f5f8] text-slate-900 dark:bg-[#09090b] dark:text-slate-100">
        <Sidebar currentUser={currentUser} />
        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardHeader currentUser={currentUser} />
          <MobileDashboardNav />
          <main className="flex-1 overflow-x-hidden">{children}</main>
        </div>
      </div>
    </DashboardNavProvider>
  );
}
