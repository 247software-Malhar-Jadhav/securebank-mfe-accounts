import { cn } from "@/lib/utils";

/** shadcn/ui Skeleton — pulsing placeholder for loading states. */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}

export { Skeleton };
