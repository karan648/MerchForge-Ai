import { notFound } from "next/navigation";

import { CheckoutWorkspace } from "@/features/checkout/components/checkout-workspace";
import { getCheckoutProductById } from "@/features/checkout/server/checkout-service";

type CheckoutPageProps = {
  params: Promise<{
    productId: string;
  }>;
};

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { productId } = await params;
  const product = await getCheckoutProductById(productId);

  if (!product) {
    notFound();
  }

  return <CheckoutWorkspace product={product} />;
}
