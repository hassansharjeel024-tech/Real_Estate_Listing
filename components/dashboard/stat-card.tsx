import type { LucideIcon } from "lucide-react";

export function StatCard({ label, value, icon: Icon, hint }: {
  label: string; value: number | string; icon: LucideIcon; hint?: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm text-muted">{label}</p>
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand/10 text-brand">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
