import type { Metadata } from "next";
import { ProfileForm } from "./profile-form";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export const metadata: Metadata = { title: "Your profile" };

export default async function AgentProfilePage() {
  const agent = await requireRole("AGENT");
  const user = await prisma.user.findUnique({
    where: { id: agent.id },
    include: { agentProfile: true },
  });

  return (
    <>
      <h1 className="font-display text-3xl">Your profile</h1>
      <p className="mt-1 text-sm text-muted">Buyers see this on every listing you publish.</p>
      <div className="mt-6 max-w-2xl">
        <ProfileForm
          initial={{
            name: user?.name ?? "",
            phone: user?.phone ?? "",
            company: user?.agentProfile?.company ?? "",
            licenseNo: user?.agentProfile?.licenseNo ?? "",
            whatsapp: user?.agentProfile?.whatsapp ?? "",
            bio: user?.agentProfile?.bio ?? "",
            photoUrl: user?.agentProfile?.photoUrl ?? "",
          }}
        />
      </div>
    </>
  );
}
