import { Suspense } from "react";
import type { Metadata } from "next";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { CustomersView } from "./customers-view";

export const metadata: Metadata = {
  title: "Customers",
  description: "Segments, lifetime value and purchase history for every customer.",
};

export default function CustomersPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <CustomersView />
    </Suspense>
  );
}
