import { redirect } from "next/navigation";

import { getOnboardingSession } from "@/features/onboarding/server/onboarding-service";
import { StorefrontWorkspace } from "@/features/storefront/components/storefront-workspace";
import { getStorefrontOverview } from "@/features/storefront/server/storefront-service";

export default async function StorefrontPage() {
  const session = await getOnboardingSession();

  if (!session) {
    redirect("/login");
  }

  const overview = await getStorefrontOverview(session.id);

  return <StorefrontWorkspace overview={overview} />;
}
