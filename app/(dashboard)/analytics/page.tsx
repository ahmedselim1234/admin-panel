import type { Metadata } from "next";
import { AnalyticsView } from "./analytics-view";

export const metadata: Metadata = {
  title: "Analytics",
  description: "Channel, category, traffic and time-of-day performance analysis.",
};

export default function AnalyticsPage() {
  return <AnalyticsView />;
}
