"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

export function SheetContent({
  className,
  children,
  side = "right",
  width = "md",
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  side?: "left" | "right";
  width?: "sm" | "md" | "lg";
}) {
  const sizes = { sm: "sm:max-w-sm", md: "sm:max-w-md", lg: "sm:max-w-xl" };

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className={cn(
          "fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-[2px]",
          "data-[state=open]:anim-overlay-in data-[state=closed]:anim-overlay-out",
        )}
      />
      <DialogPrimitive.Content
        className={cn(
          "fixed inset-y-0 z-50 flex w-full flex-col border-border bg-surface shadow-2xl",
          side === "right"
            ? "right-0 border-l data-[state=open]:anim-sheet-in-right data-[state=closed]:anim-sheet-out-right"
            : "left-0 border-r data-[state=open]:anim-sheet-in-left data-[state=closed]:anim-sheet-out-left",
          sizes[width],
          className,
        )}
        {...props}
      >
        <DialogPrimitive.Close
          className="absolute top-4 right-4 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
          aria-label="Close"
        >
          <X className="size-4" />
        </DialogPrimitive.Close>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("shrink-0 space-y-1 border-b border-border px-6 py-5 pr-12", className)}
      {...props}
    />
  );
}

export const SheetTitle = ({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) => (
  <DialogPrimitive.Title
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
);

export const SheetDescription = ({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) => (
  <DialogPrimitive.Description
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
);

export function SheetBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex-1 overflow-y-auto scrollbar-thin px-6 py-5", className)} {...props} />;
}

export function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("shrink-0 flex gap-2 border-t border-border px-6 py-4", className)}
      {...props}
    />
  );
}
