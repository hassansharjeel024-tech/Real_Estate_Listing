import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Empty state: an invitation to act, never a shrug. Always give the reader the
 * next step.
 */
export function EmptyState({ icon: Icon, title, body, action }: {
  icon: LucideIcon;
  title: string;
  body: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-brand/10 text-brand">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="font-display text-xl text-ink">{title}</h3>
      <p className="max-w-sm text-sm text-muted">{body}</p>
      {action && (
        <Link href={action.href} className="mt-2 text-sm font-medium text-brand hover:underline">
          {action.label}
        </Link>
      )}
    </div>
  );
}

/** Error state: what happened, and what to do about it. No apologies. */
export function ErrorState({ title = "That didn't load", body, retry }: {
  title?: string; body: string; retry?: () => void;
}) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center">
      <h3 className="font-display text-xl text-ink">{title}</h3>
      <p className="max-w-sm text-sm text-muted">{body}</p>
      {retry && (
        <button onClick={retry} className="text-sm font-medium text-brand hover:underline">
          Try again
        </button>
      )}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-line/60", className)} />;
}

export function PropertyCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}
