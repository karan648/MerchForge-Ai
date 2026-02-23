import { notFound } from "next/navigation";

import { getSessionUserId } from "@/features/onboarding/server/session-user";
import { StorefrontWorkspace } from "@/features/storefront/components/storefront-workspace";
import { getPublicStorefrontOverviewByUserId } from "@/features/storefront/server/storefront-service";

type PublicStorefrontPageProps = {
  params: Promise<{
    userId: string;
  }>;
};

export default async function PublicStorefrontPage({ params }: PublicStorefrontPageProps) {
  const { userId } = await params;
  const viewerUserId = await getSessionUserId();
  const storefront = await getPublicStorefrontOverviewByUserId(userId, viewerUserId);

  if (!storefront) {
    notFound();
  }

  return <StorefrontWorkspace overview={storefront} mode="public" />;
}
