import type { Metadata } from "next";
import Link from "next/link";
import { Inbox } from "lucide-react";
import { EmptyState } from "@/components/ui/states";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "All inquiries" };

export default async function AdminInquiriesPage() {
  await requireRole("ADMIN");

  const inquiries = await prisma.inquiry.findMany({
    orderBy: { createdAt: "desc" },
    take: 200, // a full table scan is fine at this scale; paginate past ~1k rows
    include: {
      buyer: { select: { name: true, email: true } },
      property: { select: { slug: true, title: true, agent: { select: { name: true } } } },
    },
  });

  return (
    <>
      <h1 className="font-display text-3xl">Inquiries</h1>
      <p className="mt-1 text-sm text-muted">Every message sent through the portal, newest first.</p>

      <div className="mt-6">
        {inquiries.length === 0 ? (
          <EmptyState icon={Inbox} title="No inquiries yet"
            body="Buyer messages will show up here once listings go live."
            action={{ href: "/dashboard/admin/properties", label: "Review listings" }} />
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Buyer</th>
                  <th className="px-4 py-3 font-medium">Property</th>
                  <th className="px-4 py-3 font-medium">Agent</th>
                  <th className="px-4 py-3 font-medium">Message</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Sent</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="border-b border-line last:border-0 align-top">
                    <td className="px-4 py-3">
                      <p className="font-medium">{inquiry.buyer.name}</p>
                      <p className="text-xs text-muted">{inquiry.buyer.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/properties/${inquiry.property.slug}`} className="hover:text-brand">
                        {inquiry.property.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted">{inquiry.property.agent.name}</td>
                    <td className="max-w-xs px-4 py-3 text-muted">
                      <p className="line-clamp-2">{inquiry.message}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={inquiry.status === "NEW" ? "brand" : "neutral"}>
                        {inquiry.status.toLowerCase()}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted">{formatDate(inquiry.createdAt)}</td>
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
