import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import type { ListingStatus } from "@prisma/client";
import { Building2 } from "lucide-react";
import { EmptyState } from "@/components/ui/states";
import { StatusBadge } from "@/components/ui/badge";
import { ModerationControls } from "@/components/dashboard/moderation-controls";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { formatDate, formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Moderate listings" };

const TABS: { value: ListingStatus | "ALL"; label: string }[] = [
  { value: "PENDING", label: "In review" },
  { value: "APPROVED", label: "Live" },
  { value: "REJECTED", label: "Rejected" },
  { value: "ALL", label: "Everything" },
];

export default async function AdminPropertiesPage({
  searchParams,
}: { searchParams: Promise<{ status?: string }> }) {
  await requireRole("ADMIN");
  const { status } = await searchParams;
  const active = (TABS.find((t) => t.value === status)?.value ?? "PENDING") as ListingStatus | "ALL";

  const properties = await prisma.property.findMany({
    where: active === "ALL" ? {} : { status: active },
    orderBy: { createdAt: "desc" },
    include: {
      city: true,
      agent: { select: { id: true, name: true } },
      _count: { select: { inquiries: true } },
    },
  });

  return (
    <>
      <h1 className="font-display text-3xl">Listings</h1>
      <p className="mt-1 text-sm text-muted">Approve, reject, feature or remove any listing on the portal.</p>

      <nav className="mt-6 flex gap-1 border-b border-line" aria-label="Filter by status">
        {TABS.map((tab) => (
          <Link key={tab.value} href={`/dashboard/admin/properties?status=${tab.value}`}
            aria-current={active === tab.value ? "page" : undefined}
            className={cn("border-b-2 px-4 py-2 text-sm transition-colors",
              active === tab.value ? "border-brand font-medium text-brand" : "border-transparent text-muted hover:text-ink")}>
            {tab.label}
          </Link>
        ))}
      </nav>

      <div className="mt-6 space-y-4">
        {properties.length === 0 ? (
          <EmptyState icon={Building2} title="Nothing here"
            body={active === "PENDING" ? "The review queue is empty. Nice." : "No listings match this filter."}
            action={{ href: "/dashboard/admin/properties?status=ALL", label: "See everything" }} />
        ) : (
          properties.map((property) => (
            <article key={property.id} className="card flex flex-col gap-4 p-4 sm:flex-row">
              {property.featuredImage ? (
                <Image src={property.featuredImage} alt="" width={160} height={120}
                  className="h-28 w-full rounded-lg object-cover sm:w-40" />
              ) : (
                <div className="grid h-28 w-full place-items-center rounded-lg bg-line/50 text-xs text-muted sm:w-40">
                  No photo
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={property.status} />
                  {property.isFeatured && <span className="text-xs text-accent">★ Featured</span>}
                </div>
                <Link href={`/properties/${property.slug}`} className="mt-1 block font-medium hover:text-brand">
                  {property.title}
                </Link>
                <p className="mt-0.5 text-sm text-muted">
                  {formatPrice(property.price)} · {property.area}, {property.city.name} ·{" "}
                  {property.sizeSqft.toLocaleString()} sq ft
                </p>
                <p className="mt-1 text-xs text-muted">
                  By <Link href={`/agents/${property.agent.id}`} className="underline hover:text-ink">{property.agent.name}</Link>
                  {" "}· {formatDate(property.createdAt)} · {property._count.inquiries} inquiries
                </p>
                {property.rejectionNote && (
                  <p className="mt-2 text-xs text-danger">Rejection note: {property.rejectionNote}</p>
                )}
              </div>

              <ModerationControls
                propertyId={property.id}
                status={property.status}
                isFeatured={property.isFeatured}
              />
            </article>
          ))
        )}
      </div>
    </>
  );
}
