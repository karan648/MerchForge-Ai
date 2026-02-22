import { redirect } from "next/navigation";

import { getOnboardingSession } from "@/features/onboarding/server/onboarding-service";
import { TemplateMarketplaceWorkspace } from "@/features/templates/components/template-marketplace-workspace";
import { getTemplateMarketplaceOverview } from "@/features/templates/server/template-marketplace-service";

export default async function TemplatesPage() {
  const session = await getOnboardingSession();
  if (!session) {
    redirect("/login");
  }

  const overview = await getTemplateMarketplaceOverview(session.id);

  return <TemplateMarketplaceWorkspace overview={overview} />;
}
