import { cn } from "@/lib/utils";

type Tone = "neutral" | "brand" | "accent" | "success" | "danger" | "warning";

const TONES: Record<Tone, string> = {
  neutral: "bg-line/50 text-muted",
  brand: "bg-brand/10 text-brand",
  accent: "bg-accent/15 text-accent",
  success: "bg-success/10 text-success",
  danger: "bg-danger/10 text-danger",
  warning: "bg-accent/15 text-accent",
};

export function Badge({ tone = "neutral", className, children }: {
  tone?: Tone; className?: string; children: React.ReactNode;
}) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
      TONES[tone], className,
    )}>
      {children}
    </span>
  );
}

/** Maps listing status to a tone so the mapping lives in one file. */
export function StatusBadge({ status }: { status: "PENDING" | "APPROVED" | "REJECTED" }) {
  const map = {
    PENDING: { tone: "warning" as const, label: "In review" },
    APPROVED: { tone: "success" as const, label: "Live" },
    REJECTED: { tone: "danger" as const, label: "Rejected" },
  };
  return <Badge tone={map[status].tone}>{map[status].label}</Badge>;
}
