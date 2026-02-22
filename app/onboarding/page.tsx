import { redirect } from "next/navigation";

import { getOnboardingSession } from "@/features/onboarding/server/onboarding-service";

export default async function OnboardingIndexPage() {
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

  redirect("/onboarding/brand");
}
