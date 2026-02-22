import { DashboardShell } from "@/components/layout";
import { getOnboardingSession } from "@/features/onboarding/server/onboarding-service";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getOnboardingSession();

  if (!session) {
    redirect("/login");
  }

  if (!session.onboardingCompleted) {
    redirect("/onboarding");
  }

  return (
    <DashboardShell
      currentUser={{
        fullName: session.fullName,
        email: session.email,
        username: session.username,
        avatarUrl: session.avatarUrl,
      }}
    >
      {children}
    </DashboardShell>
  );
}
