import { redirect } from "next/navigation";

import { BrandStep } from "@/features/onboarding/components/brand-step";
import { getOnboardingSession } from "@/features/onboarding/server/onboarding-service";

export default async function OnboardingBrandPage() {
  const session = await getOnboardingSession();

  if (!session) {
    redirect("/login");
  }

  if (session.onboardingCompleted) {
    redirect("/dashboard");
  }

  if (!session.useCase) {
    redirect("/onboarding/use-case");
  }

  if (!session.experienceLevel) {
    redirect("/onboarding/experience");
  }

  return (
    <BrandStep
      initialBrandName={session.brandKit?.name === "Default" ? "" : (session.brandKit?.name ?? "")}
      initialLogoUrl={session.brandKit?.logoUrl ?? null}
    />
  );
}
