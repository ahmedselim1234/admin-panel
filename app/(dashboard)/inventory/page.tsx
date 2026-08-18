import { Suspense } from "react";
import type { Metadata } from "next";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { InventoryView } from "./inventory-view";

export const metadata: Metadata = {
  title: "Inventory",
  description: "Stock levels, low-stock alerts and restocking across warehouses.",
};

export default function InventoryPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <InventoryView />
    </Suspense>
  );
}
