import { redirect } from "next/navigation";

import { SettingsWorkspace } from "@/features/settings/components/settings-workspace";
import { getOnboardingSession } from "@/features/onboarding/server/onboarding-service";

export default async function SettingsPage() {
  const session = await getOnboardingSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <SettingsWorkspace
      user={{
        fullName: session.fullName ?? "",
        email: session.email,
        bio: session.bio ?? "",
        avatarUrl: session.avatarUrl ?? "",
      }}
      brandKit={{
        brandName: session.brandKit?.name === "Default" ? "" : (session.brandKit?.name ?? ""),
        logoUrl: session.brandKit?.logoUrl ?? "",
        primaryColor: session.brandKit?.primaryColor ?? "#895af6",
      }}
    />
  );
}
