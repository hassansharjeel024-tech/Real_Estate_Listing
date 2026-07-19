import type { Metadata } from "next";
import Link from "next/link";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import { UserActiveToggle } from "@/components/dashboard/user-active-toggle";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Manage agents" };

export default async function AdminAgentsPage() {
  await requireRole("ADMIN");

  const agents = await prisma.user.findMany({
    where: { role: "AGENT" },
    orderBy: { createdAt: "desc" },
    include: {
      agentProfile: { select: { company: true } },
      _count: { select: { properties: true } },
    },
  });

  return (
    <>
      <h1 className="font-display text-3xl">Agents</h1>
      <p className="mt-1 text-sm text-muted">
        Deactivating an agent blocks their login and hides their listings from search.
      </p>

      <div className="mt-6">
        {agents.length === 0 ? (
          <EmptyState icon={Users} title="No agents yet"
            body="Agents appear here as soon as they register."
            action={{ href: "/dashboard/admin", label: "Back to overview" }} />
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Agent</th>
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Listings</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {agents.map((agent) => (
                  <tr key={agent.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3">
                      <Link href={`/agents/${agent.id}`} className="font-medium hover:text-brand">{agent.name}</Link>
                      <p className="text-xs text-muted">{agent.email}</p>
                    </td>
                    <td className="px-4 py-3 text-muted">{agent.agentProfile?.company ?? "—"}</td>
                    <td className="px-4 py-3 tabular-nums">{agent._count.properties}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted">{formatDate(agent.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={agent.isActive ? "success" : "danger"}>
                        {agent.isActive ? "Active" : "Deactivated"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <UserActiveToggle userId={agent.id} isActive={agent.isActive} />
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
