import type { Metadata } from "next";
import { SettingsView } from "./settings-view";

export const metadata: Metadata = {
  title: "Settings",
  description: "Store profile, payments, shipping, notifications and team access.",
};

export default function SettingsPage() {
  return <SettingsView />;
}
