import type { Metadata } from "next";
import { UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import { UserActiveToggle } from "@/components/dashboard/user-active-toggle";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Manage buyers" };

export default async function AdminBuyersPage() {
  await requireRole("ADMIN");

  const buyers = await prisma.user.findMany({
    where: { role: "BUYER" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { inquiries: true, favorites: true } } },
  });

  return (
    <>
      <h1 className="font-display text-3xl">Buyers</h1>
      <p className="mt-1 text-sm text-muted">Registered buyer accounts and their activity.</p>

      <div className="mt-6">
        {buyers.length === 0 ? (
          <EmptyState icon={UserRound} title="No buyers yet"
            body="Buyer accounts appear here as soon as someone registers."
            action={{ href: "/dashboard/admin", label: "Back to overview" }} />
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Buyer</th>
                  <th className="px-4 py-3 font-medium">Inquiries</th>
                  <th className="px-4 py-3 font-medium">Saved</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {buyers.map((buyer) => (
                  <tr key={buyer.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium">{buyer.name}</p>
                      <p className="text-xs text-muted">{buyer.email}</p>
                    </td>
                    <td className="px-4 py-3 tabular-nums">{buyer._count.inquiries}</td>
                    <td className="px-4 py-3 tabular-nums">{buyer._count.favorites}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted">{formatDate(buyer.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={buyer.isActive ? "success" : "danger"}>
                        {buyer.isActive ? "Active" : "Deactivated"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <UserActiveToggle userId={buyer.id} isActive={buyer.isActive} />
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
