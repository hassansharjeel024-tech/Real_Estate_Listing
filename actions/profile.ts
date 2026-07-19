"use server";
/** Profile management: agent details, and password changes for any role. */
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole, getCurrentUser, verifyPassword, hashPassword } from "@/lib/auth";
import { agentProfileSchema, changePasswordSchema } from "@/lib/validations";

export async function updateAgentProfile(_prev: unknown, formData: FormData) {
  const agent = await requireRole("AGENT");
  const parsed = agentProfileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, message: "Fix the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { name, phone, ...profile } = parsed.data;
  await prisma.user.update({
    where: { id: agent.id },
    data: {
      name,
      phone: phone || null,
      agentProfile: {
        // `upsert` covers agents seeded before the profile row existed.
        upsert: {
          create: {
            company: profile.company || null,
            licenseNo: profile.licenseNo || null,
            whatsapp: profile.whatsapp || null,
            bio: profile.bio || null,
            photoUrl: profile.photoUrl || null,
          },
          update: {
            company: profile.company || null,
            licenseNo: profile.licenseNo || null,
            whatsapp: profile.whatsapp || null,
            bio: profile.bio || null,
            photoUrl: profile.photoUrl || null,
          },
        },
      },
    },
  });

  revalidatePath("/dashboard/agent/profile");
  revalidatePath(`/agents/${agent.id}`);
  return { ok: true, message: "Profile saved." };
}

/**
 * Password change for any signed-in role (Admin, Agent, or Buyer).
 * Requires the current password so a hijacked session alone can't lock the
 * real owner out.
 */
export async function changePassword(_prev: unknown, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "You need to sign in first." };

  const parsed = changePasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, message: "Fix the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const record = await prisma.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });
  if (!record) return { ok: false, message: "Account not found." };

  const isValid = await verifyPassword(parsed.data.currentPassword, record.passwordHash);
  if (!isValid) {
    return {
      ok: false,
      message: "Current password is incorrect.",
      fieldErrors: { currentPassword: ["Current password is incorrect."] },
    };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(parsed.data.newPassword) },
  });

  revalidatePath("/dashboard/admin/profile");
  revalidatePath("/dashboard/agent/profile");
  return { ok: true, message: "Password updated." };
}