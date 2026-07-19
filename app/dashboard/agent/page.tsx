import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Building2, Eye, Inbox, PlusCircle } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import { Button } from "@/components/ui/button";
import { PropertyRowActions } from "@/components/dashboard/property-row-actions";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { formatDate, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Agent dashboard" };

export default async function AgentDashboard() {
  const agent = await requireRole("AGENT");

  const [properties, live, pending, inquiryCount] = await Promise.all([
    prisma.property.findMany({
      where: { agentId: agent.id },
      orderBy: { createdAt: "desc" },
      include: { city: true, _count: { select: { inquiries: true } } },
    }),
    prisma.property.count({ where: { agentId: agent.id, status: "APPROVED" } }),
    prisma.property.count({ where: { agentId: agent.id, status: "PENDING" } }),
    prisma.inquiry.count({ where: { property: { agentId: agent.id }, status: "NEW" } }),
  ]);

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Overview</h1>
        <Link href="/dashboard/agent/properties/new">
          <Button><PlusCircle className="h-4 w-4" /> Add property</Button>
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total listings" value={properties.length} icon={Building2} />
        <StatCard label="Live" value={live} icon={Eye} hint="Visible in search" />
        <StatCard label="In review" value={pending} icon={Eye} hint="Waiting on an admin" />
        <StatCard label="New inquiries" value={inquiryCount} icon={Inbox} hint="Unread" />
      </div>

      <h2 className="mt-10 font-display text-xl">Your listings</h2>
      <div className="mt-4">
        {properties.length === 0 ? (
          <EmptyState icon={Building2} title="No listings yet"
            body="Add your first property. It goes live once an admin reviews it."
            action={{ href: "/dashboard/agent/properties/new", label: "Add a property" }} />
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Property</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Inquiries</th>
                  <th className="px-4 py-3 font-medium">Added</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {properties.map((property) => (
                  <tr key={property.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {property.featuredImage ? (
                          <Image src={property.featuredImage} alt="" width={48} height={36}
                            className="h-9 w-12 rounded object-cover" />
                        ) : (
                          <span className="h-9 w-12 rounded bg-line/60" />
                        )}
                        <div className="min-w-0">
                          <Link href={`/properties/${property.slug}`} className="line-clamp-1 font-medium hover:text-brand">
                            {property.title}
                          </Link>
                          <p className="text-xs text-muted">{property.area}, {property.city.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">{formatPrice(property.price)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={property.status} />
                      {property.status === "REJECTED" && property.rejectionNote && (
                        <p className="mt-1 max-w-[16rem] text-xs text-danger">{property.rejectionNote}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 tabular-nums">{property._count.inquiries}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted">{formatDate(property.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <PropertyRowActions propertyId={property.id} title={property.title} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
