import { redirect } from "next/navigation";

import { DesignsWorkspace } from "@/features/designs/components/designs-workspace";
import { getDesignsOverview } from "@/features/designs/server/designs-service";
import { getOnboardingSession } from "@/features/onboarding/server/onboarding-service";

export default async function DesignsPage() {
  const session = await getOnboardingSession();

  if (!session) {
    redirect("/login");
  }

  const overview = await getDesignsOverview(session.id);

  return <DesignsWorkspace overview={overview} />;
}
