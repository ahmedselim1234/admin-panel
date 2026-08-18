import { Suspense } from "react";
import type { Metadata } from "next";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { ProductsView } from "./products-view";

export const metadata: Metadata = {
  title: "Products",
  description: "Browse, filter and manage the product catalogue.",
};

export default function ProductsPage() {
  return (
    <Suspense fallback={<PageSkeleton cards={0} />}>
      <ProductsView />
    </Suspense>
  );
}
