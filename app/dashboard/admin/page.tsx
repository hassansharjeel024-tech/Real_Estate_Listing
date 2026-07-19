import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Clock, Inbox, UserRound, Users } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { CityChart } from "@/components/dashboard/city-chart";
import { StatusBadge } from "@/components/ui/badge";
import { getAdminStats } from "@/lib/queries";
import { requireRole } from "@/lib/auth";
import { formatDate, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin dashboard" };

export default async function AdminDashboard() {
  await requireRole("ADMIN");
  const { totals, byCity, recent } = await getAdminStats();

  return (
    <>
      <h1 className="font-display text-3xl">Overview</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total properties" value={totals.properties} icon={Building2} />
        <StatCard label="Awaiting review" value={totals.pending} icon={Clock}
          hint={totals.pending > 0 ? "Needs your attention" : "All clear"} />
        <StatCard label="Agents" value={totals.agents} icon={Users} />
        <StatCard label="Buyers" value={totals.buyers} icon={UserRound} />
        <StatCard label="Inquiries" value={totals.inquiries} icon={Inbox} />
      </div>

      {totals.pending > 0 && (
        <Link href="/dashboard/admin/properties?status=PENDING"
          className="mt-6 flex items-center justify-between rounded-xl border border-accent/40 bg-accent/10 px-5 py-4 text-sm hover:border-accent">
          <span>
            <strong>{totals.pending}</strong> {totals.pending === 1 ? "listing is" : "listings are"} waiting for review.
          </span>
          <span className="font-medium text-brand">Review now →</span>
        </Link>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="font-display text-lg">Listings by city</h2>
          <div className="mt-4"><CityChart data={byCity} /></div>
        </section>

        <section className="card p-5">
          <h2 className="font-display text-lg">Latest submissions</h2>
          <ul className="mt-4 divide-y divide-line">
            {recent.length === 0 && <li className="py-8 text-center text-sm text-muted">Nothing submitted yet.</li>}
            {recent.map((property) => (
              <li key={property.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <Link href={`/properties/${property.slug}`} className="line-clamp-1 text-sm font-medium hover:text-brand">
                    {property.title}
                  </Link>
                  <p className="text-xs text-muted">
                    {property.city.name} · {formatPrice(property.price)} · {formatDate(property.createdAt)}
                  </p>
                </div>
                <StatusBadge status={property.status} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
