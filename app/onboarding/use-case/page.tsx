import { redirect } from "next/navigation";

import { UseCaseStep } from "@/features/onboarding/components/use-case-step";
import { getOnboardingSession } from "@/features/onboarding/server/onboarding-service";

export default async function OnboardingUseCasePage() {
  const session = await getOnboardingSession();

  if (!session) {
    redirect("/login");
  }

  if (session.onboardingCompleted) {
    redirect("/dashboard");
  }

  return <UseCaseStep initialUseCase={session.useCase ?? "PERSONAL"} />;
}
