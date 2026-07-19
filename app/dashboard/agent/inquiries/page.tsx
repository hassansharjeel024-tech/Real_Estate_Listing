import type { Metadata } from "next";
import Link from "next/link";
import { Inbox } from "lucide-react";
import { EmptyState } from "@/components/ui/states";
import { InquiryStatusPicker } from "@/components/dashboard/inquiry-status-picker";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Inquiries" };

export default async function AgentInquiriesPage() {
  const agent = await requireRole("AGENT");

  const inquiries = await prisma.inquiry.findMany({
    where: { property: { agentId: agent.id } },
    orderBy: { createdAt: "desc" },
    include: {
      property: { select: { slug: true, title: true } },
      // Only name and email — the buyer's phone is never surfaced here.
      buyer: { select: { name: true, email: true } },
    },
  });

  return (
    <>
      <h1 className="font-display text-3xl">Inquiries</h1>
      <p className="mt-1 text-sm text-muted">
        Reply by email. Buyers' phone numbers are private unless they share one.
      </p>

      <div className="mt-6 space-y-4">
        {inquiries.length === 0 ? (
          <EmptyState icon={Inbox} title="No inquiries yet"
            body="When a buyer messages you about a listing, it lands here."
            action={{ href: "/dashboard/agent", label: "Back to overview" }} />
        ) : (
          inquiries.map((inquiry) => (
            <article key={inquiry.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{inquiry.buyer.name}</p>
                  <a href={`mailto:${inquiry.buyer.email}`} className="text-sm text-brand hover:underline">
                    {inquiry.buyer.email}
                  </a>
                  <p className="mt-1 text-xs text-muted">
                    About{" "}
                    <Link href={`/properties/${inquiry.property.slug}`} className="underline hover:text-ink">
                      {inquiry.property.title}
                    </Link>{" "}
                    · {formatDate(inquiry.createdAt)}
                  </p>
                </div>
                <InquiryStatusPicker inquiryId={inquiry.id} status={inquiry.status} />
              </div>

              <p className="mt-4 whitespace-pre-line rounded-lg bg-paper p-3 text-sm leading-relaxed">
                {inquiry.message}
              </p>
              {inquiry.contactPreference && (
                <p className="mt-2 text-xs text-muted">Prefers: {inquiry.contactPreference}</p>
              )}
            </article>
          ))
        )}
      </div>
    </>
  );
}
