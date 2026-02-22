import { redirect } from "next/navigation";

import { FinishedStep } from "@/features/onboarding/components/finished-step";
import { getOnboardingSession } from "@/features/onboarding/server/onboarding-service";

function resolveFirstName(fullName: string | null): string {
  if (!fullName) {
    return "Creator";
  }

  return fullName.trim().split(/\s+/)[0] || "Creator";
}

export default async function OnboardingFinishedPage() {
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

  return <FinishedStep firstName={resolveFirstName(session.fullName)} />;
}
