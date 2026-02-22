import { notFound, redirect } from "next/navigation";

import { MockupEditorWorkspace } from "@/features/mockups/components/mockup-editor-workspace";
import { getMockupEditorDataForUser } from "@/features/mockups/server/mockup-editor-service";
import { getOnboardingSession } from "@/features/onboarding/server/onboarding-service";

type MockupEditorPageProps = {
  params: Promise<{
    mockupId: string;
  }>;
};

export default async function MockupEditorPage({ params }: MockupEditorPageProps) {
  const session = await getOnboardingSession();

  if (!session) {
    redirect("/login");
  }

  const { mockupId } = await params;
  const mockup = await getMockupEditorDataForUser(session.id, mockupId);

  if (!mockup) {
    notFound();
  }

  return <MockupEditorWorkspace mockup={mockup} />;
}
