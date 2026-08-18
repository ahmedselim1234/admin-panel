import { Suspense } from "react";
import type { Metadata } from "next";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { OrdersView } from "./orders-view";

export const metadata: Metadata = {
  title: "Orders",
  description: "Track, filter and fulfil customer orders.",
};

export default function OrdersPage() {
  return (
    <Suspense fallback={<PageSkeleton cards={0} />}>
      <OrdersView />
    </Suspense>
  );
}
