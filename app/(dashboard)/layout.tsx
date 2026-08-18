import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="mx-auto w-full max-w-[100rem] flex-1 space-y-6 px-4 py-6 sm:px-6 lg:py-8">
          {children}
        </main>
        <footer className="border-t border-border px-4 py-5 sm:px-6">
          <p className="mx-auto max-w-[100rem] text-[12px] text-muted-foreground">
            Selim Commerce Admin — portfolio demo by{" "}
            <span className="font-medium text-foreground">Ahmed Selim</span>. All data is generated
            locally; no real store is connected.
          </p>
        </footer>
      </div>
    </div>
  );
}
