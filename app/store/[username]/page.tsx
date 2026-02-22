import { notFound } from "next/navigation";

import { StorefrontWorkspace } from "@/features/storefront/components/storefront-workspace";
import { getPublicStorefrontOverviewByUsername } from "@/features/storefront/server/storefront-service";

type PublicStorefrontPageProps = {
  params: Promise<{
    username: string;
  }>;
};

export default async function PublicStorefrontPage({ params }: PublicStorefrontPageProps) {
  const { username } = await params;
  const storefront = await getPublicStorefrontOverviewByUsername(username);

  if (!storefront) {
    notFound();
  }

  return <StorefrontWorkspace overview={storefront} mode="public" />;
}
