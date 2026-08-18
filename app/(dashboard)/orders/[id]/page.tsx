import type { Metadata } from "next";
import { OrderDetailView } from "./order-detail-view";

export const metadata: Metadata = {
  title: "Order details",
  description: "Line items, fulfilment timeline and customer information for a single order.",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrderDetailView orderId={id} />;
}
