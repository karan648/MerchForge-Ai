import { redirect } from "next/navigation";

import { getOnboardingSession } from "@/features/onboarding/server/onboarding-service";
import { createBlankMockupForUser } from "@/features/mockups/server/mockup-editor-service";

export const dynamic = "force-dynamic";

export default async function NewMockupPage() {
  const session = await getOnboardingSession();

  if (!session) {
    redirect("/login");
  }

  const mockupId = await createBlankMockupForUser(session.id);
  redirect(`/dashboard/mockups/${mockupId}`);
}
