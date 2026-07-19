import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Building2, Mail, Phone } from "lucide-react";
import { PropertyCard } from "@/components/property/property-card";
import { EmptyState } from "@/components/ui/states";
import { prisma } from "@/lib/prisma";
import { propertyCardSelect } from "@/lib/queries";
import { initials } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

async function getAgent(id: string) {
  return prisma.user.findFirst({
    where: { id, role: "AGENT", isActive: true },
    select: {
      id: true, name: true, email: true, phone: true, createdAt: true,
      agentProfile: true,
      properties: {
        where: { status: "APPROVED" },
        select: propertyCardSelect,
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const agent = await getAgent(id);
  return { title: agent ? `${agent.name} — agent profile` : "Agent not found" };
}

export default async function AgentProfilePage({ params }: Props) {
  const { id } = await params;
  const agent = await getAgent(id);
  if (!agent) notFound();

  const profile = agent.agentProfile;

  return (
    <div className="container-page py-10">
      <header className="card flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
        {profile?.photoUrl ? (
          <Image src={profile.photoUrl} alt="" width={96} height={96}
            className="h-24 w-24 rounded-full object-cover" />
        ) : (
          <span className="grid h-24 w-24 shrink-0 place-items-center rounded-full bg-brand/10 font-display text-2xl text-brand">
            {initials(agent.name)}
          </span>
        )}

        <div className="flex-1">
          <h1 className="font-display text-3xl">{agent.name}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
            <Building2 className="h-4 w-4" /> {profile?.company ?? "Independent agent"}
            {profile?.licenseNo && <span className="text-xs">· Licence {profile.licenseNo}</span>}
          </p>
          {profile?.bio && <p className="mt-3 max-w-2xl text-sm text-muted">{profile.bio}</p>}

          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <a href={`mailto:${agent.email}`} className="flex items-center gap-1.5 text-brand hover:underline">
              <Mail className="h-4 w-4" /> {agent.email}
            </a>
            {agent.phone && (
              <a href={`tel:${agent.phone}`} className="flex items-center gap-1.5 text-brand hover:underline">
                <Phone className="h-4 w-4" /> {agent.phone}
              </a>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-brand/5 px-6 py-4 text-center">
          <p className="font-display text-3xl text-brand">{agent.properties.length}</p>
          <p className="text-xs text-muted">active {agent.properties.length === 1 ? "listing" : "listings"}</p>
        </div>
      </header>

      <section className="mt-10">
        <h2 className="font-display text-2xl">Published listings</h2>
        <div className="mt-6">
          {agent.properties.length === 0 ? (
            <EmptyState icon={Building2} title="No live listings"
              body={`${agent.name} has nothing published right now. Check back soon.`}
              action={{ href: "/properties", label: "Browse all listings" }} />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {agent.properties.map((property) => <PropertyCard key={property.id} property={property} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
