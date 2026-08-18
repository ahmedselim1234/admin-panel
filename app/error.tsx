"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In a real app this is where the error would go to Sentry/Datadog.
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-danger-soft text-danger">
        <AlertTriangle className="size-7" />
      </span>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-md text-[14px] leading-relaxed text-muted-foreground">
        {error.message || "An unexpected error occurred while rendering this page."}
      </p>
      <Button onClick={reset} size="lg" className="mt-7">
        <RefreshCw />
        Try again
      </Button>
    </main>
  );
}
