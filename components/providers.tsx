"use client";

import { ThemeProvider } from "next-themes";
import { Tooltip as TooltipPrimitive } from "radix-ui";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      <TooltipPrimitive.Provider delayDuration={200}>
        {children}
        <Toaster
          position="bottom-right"
          closeButton
          toastOptions={{
            classNames: {
              toast:
                "!rounded-xl !border-border !bg-surface !text-foreground !card-shadow-lg !font-sans",
              description: "!text-muted-foreground",
              actionButton: "!bg-primary !text-white !rounded-lg",
              cancelButton: "!bg-surface-muted !text-muted-foreground !rounded-lg",
            },
          }}
        />
      </TooltipPrimitive.Provider>
    </ThemeProvider>
  );
}
