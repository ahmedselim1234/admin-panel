import Link from "next/link";
import { Compass, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
        <Compass className="size-7" />
      </span>
      <p className="mt-6 text-[13px] font-semibold tracking-wide text-muted-foreground uppercase">
        Error 404
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
        This page doesn&apos;t exist
      </h1>
      <p className="mt-3 max-w-md text-[14px] leading-relaxed text-muted-foreground">
        The link may be outdated, or the record was removed. Everything else is still where you left
        it.
      </p>
      <Button asChild size="lg" className="mt-7">
        <Link href="/dashboard">
          <LayoutDashboard />
          Back to dashboard
        </Link>
      </Button>
    </main>
  );
}
