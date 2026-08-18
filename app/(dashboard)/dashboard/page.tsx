import type { Metadata } from "next";
import { DashboardView } from "./dashboard-view";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Revenue, orders, customers and conversion at a glance.",
};

export default function DashboardPage() {
  return <DashboardView />;
}
