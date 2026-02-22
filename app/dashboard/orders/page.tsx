import { redirect } from "next/navigation";

import { getOnboardingSession } from "@/features/onboarding/server/onboarding-service";
import { OrdersWorkspace } from "@/features/orders/components/orders-workspace";
import { getOrdersOverview } from "@/features/orders/server/orders-service";

export default async function OrdersPage() {
  const session = await getOnboardingSession();

  if (!session) {
    redirect("/login");
  }

  const overview = await getOrdersOverview(session.id);

  return <OrdersWorkspace overview={overview} />;
}
