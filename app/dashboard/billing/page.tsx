import { redirect } from "next/navigation";

import { BillingWorkspace } from "@/features/billing/components/billing-workspace";
import { getBillingOverview } from "@/features/billing/server/billing-service";
import { getOnboardingSession } from "@/features/onboarding/server/onboarding-service";

export default async function BillingPage() {
  const session = await getOnboardingSession();

  if (!session) {
    redirect("/login");
  }

  const overview = await getBillingOverview(session.id);

  return <BillingWorkspace overview={overview} />;
}
