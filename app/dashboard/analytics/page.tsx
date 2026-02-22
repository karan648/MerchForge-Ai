import { redirect } from "next/navigation";

import { AnalyticsWorkspace } from "@/features/analytics/components/analytics-workspace";
import { getAnalyticsOverview } from "@/features/analytics/server/analytics-service";
import { getOnboardingSession } from "@/features/onboarding/server/onboarding-service";

export default async function AnalyticsPage() {
  const session = await getOnboardingSession();

  if (!session) {
    redirect("/login");
  }

  const overview = await getAnalyticsOverview(session.id);

  return <AnalyticsWorkspace overview={overview} />;
}
