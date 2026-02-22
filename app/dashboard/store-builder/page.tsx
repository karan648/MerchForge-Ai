import { redirect } from "next/navigation";

import { getOnboardingSession } from "@/features/onboarding/server/onboarding-service";
import { getStorefrontOverview } from "@/features/storefront/server/storefront-service";
import { StoreBuilderWorkspace } from "@/features/store-builder/components/store-builder-workspace";

export default async function StoreBuilderPage() {
  const session = await getOnboardingSession();

  if (!session) {
    redirect("/login");
  }

  const overview = await getStorefrontOverview(session.id);

  return <StoreBuilderWorkspace overview={overview} />;
}
