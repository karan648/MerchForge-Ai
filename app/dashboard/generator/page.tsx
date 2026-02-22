import { redirect } from "next/navigation";

import { GeneratorWorkspace } from "@/features/generator/components/generator-workspace";
import { getGeneratorWorkspaceOverview } from "@/features/generator/server/generator-service";
import { getSessionUserId } from "@/features/onboarding/server/session-user";

export default async function GeneratorPage() {
  const userId = await getSessionUserId();

  if (!userId) {
    redirect("/login");
  }

  const overview = await getGeneratorWorkspaceOverview(userId);

  return <GeneratorWorkspace overview={overview} />;
}
