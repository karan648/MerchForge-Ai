import { redirect } from "next/navigation";

import { ExperienceStep } from "@/features/onboarding/components/experience-step";
import { getOnboardingSession } from "@/features/onboarding/server/onboarding-service";

export default async function OnboardingExperiencePage() {
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

  return <ExperienceStep initialExperience={session.experienceLevel ?? "BEGINNER"} />;
}
