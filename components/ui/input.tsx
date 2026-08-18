import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, type = "text", ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "h-9.5 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground",
        "placeholder:text-muted-foreground/80 transition-colors",
        "hover:border-border-strong focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-500/12",
        "disabled:cursor-not-allowed disabled:opacity-60",
        "aria-invalid:border-danger aria-invalid:ring-danger/15",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full resize-y rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground",
        "placeholder:text-muted-foreground/80 transition-colors",
        "hover:border-border-strong focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-500/12",
        "aria-invalid:border-danger aria-invalid:ring-danger/15",
        className,
      )}
      {...props}
    />
  );
}
