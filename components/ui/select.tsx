"use client";

import * as React from "react";
import { Select as Primitive } from "radix-ui";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Select = Primitive.Root;
export const SelectValue = Primitive.Value;
export const SelectGroup = Primitive.Group;

export function SelectTrigger({
  className,
  children,
  size = "md",
  ...props
}: React.ComponentProps<typeof Primitive.Trigger> & { size?: "sm" | "md" }) {
  return (
    <Primitive.Trigger
      className={cn(
        "inline-flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-surface text-sm text-foreground transition-colors",
        "hover:border-border-strong focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-500/12",
        "disabled:cursor-not-allowed disabled:opacity-60 data-[placeholder]:text-muted-foreground",
        size === "sm" ? "h-8 px-2.5 text-[13px]" : "h-9.5 px-3",
        className,
      )}
      {...props}
    >
      {children}
      <Primitive.Icon asChild>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
      </Primitive.Icon>
    </Primitive.Trigger>
  );
}

export function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof Primitive.Content>) {
  return (
    <Primitive.Portal>
      <Primitive.Content
        position={position}
        sideOffset={6}
        className={cn(
          "relative z-50 max-h-72 min-w-[8rem] overflow-hidden rounded-xl border border-border bg-surface card-shadow-lg",
          "data-[state=open]:anim-content-in data-[state=closed]:anim-content-out",
          position === "popper" && "w-full min-w-[var(--radix-select-trigger-width)]",
          className,
        )}
        {...props}
      >
        <Primitive.Viewport className="max-h-72 overflow-y-auto scrollbar-thin p-1.5">
          {children}
        </Primitive.Viewport>
      </Primitive.Content>
    </Primitive.Portal>
  );
}

export function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Primitive.Item>) {
  return (
    <Primitive.Item
      className={cn(
        "relative flex cursor-pointer items-center rounded-lg py-2 pr-2.5 pl-8 text-[13px] font-medium outline-none select-none",
        "data-[highlighted]:bg-surface-muted data-[state=checked]:text-primary",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <span className="absolute left-2.5 flex size-4 items-center justify-center">
        <Primitive.ItemIndicator>
          <Check className="size-3.5" strokeWidth={3} />
        </Primitive.ItemIndicator>
      </span>
      <Primitive.ItemText>{children}</Primitive.ItemText>
    </Primitive.Item>
  );
}

export function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof Primitive.Label>) {
  return (
    <Primitive.Label
      className={cn("px-2.5 py-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase", className)}
      {...props}
    />
  );
}
