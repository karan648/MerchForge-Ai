import { redirect } from "next/navigation";

import { MockupsWorkspace } from "@/features/mockups/components/mockups-workspace";
import { getMockupsOverview } from "@/features/mockups/server/mockups-service";
import { getOnboardingSession } from "@/features/onboarding/server/onboarding-service";

export default async function MockupsPage() {
  const session = await getOnboardingSession();

  if (!session) {
    redirect("/login");
  }

  const overview = await getMockupsOverview(session.id);

  return <MockupsWorkspace overview={overview} />;
}
