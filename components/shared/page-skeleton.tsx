import { Skeleton } from "@/components/ui/skeleton";

/** Shell-level fallback while a route's client view (and its URL state) boots. */
export function PageSkeleton({ cards = 4, table = true }: { cards?: number; table?: boolean }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      {cards > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: cards }).map((_, index) => (
            <Skeleton key={index} className="h-[8.5rem] rounded-xl" />
          ))}
        </div>
      ) : null}
      {table ? <Skeleton className="h-[32rem] rounded-xl" /> : null}
    </div>
  );
}
