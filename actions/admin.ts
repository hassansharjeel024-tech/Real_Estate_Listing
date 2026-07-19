"use server";
/**
 * Admin mutations. These are Server Actions rather than REST endpoints because
 * they are only ever triggered from a form inside the admin dashboard and
 * benefit from `revalidatePath` running in the same round-trip.
 */
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { deleteImage } from "@/lib/blob";
import { moderationSchema } from "@/lib/validations";

export type ActionState = { ok: boolean; message: string } | null;

export async function moderateProperty(propertyId: string, formData: FormData): Promise<ActionState> {
  await requireRole("ADMIN");
  const parsed = moderationSchema.safeParse({
    status: formData.get("status"),
    rejectionNote: formData.get("rejectionNote") || undefined,
  });
  if (!parsed.success) return { ok: false, message: "Choose a valid decision." };

  const { status, rejectionNote } = parsed.data;
  if (status === "REJECTED" && !rejectionNote) {
    return { ok: false, message: "Tell the agent why the listing was rejected." };
  }

  await prisma.property.update({
    where: { id: propertyId },
    data: { status, rejectionNote: status === "REJECTED" ? rejectionNote : null },
  });

  revalidatePath("/dashboard/admin/properties");
  revalidatePath("/properties");
  return { ok: true, message: `Listing ${status.toLowerCase()}.` };
}

export async function toggleFeatured(propertyId: string): Promise<ActionState> {
  await requireRole("ADMIN");
  const current = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { isFeatured: true },
  });
  if (!current) return { ok: false, message: "Listing not found." };

  await prisma.property.update({
    where: { id: propertyId },
    data: { isFeatured: !current.isFeatured },
  });
  revalidatePath("/dashboard/admin/properties");
  revalidatePath("/");
  return { ok: true, message: current.isFeatured ? "Removed from featured." : "Marked as featured." };
}

export async function deletePropertyAsAdmin(propertyId: string): Promise<ActionState> {
  await requireRole("ADMIN");
  const images = await prisma.propertyImage.findMany({ where: { propertyId } });
  await prisma.property.delete({ where: { id: propertyId } });
  await Promise.all(images.map((image) => deleteImage(image.url)));

  revalidatePath("/dashboard/admin/properties");
  revalidatePath("/properties");
  return { ok: true, message: "Listing deleted." };
}

/**
 * Activate/deactivate an agent or buyer. Deactivating is preferred over
 * deleting: it hides their listings and blocks login while preserving the
 * inquiry history other users depend on.
 */
export async function toggleUserActive(userId: string): Promise<ActionState> {
  const admin = await requireRole("ADMIN");
  if (admin.id === userId) return { ok: false, message: "You cannot deactivate your own account." };

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { isActive: true, role: true } });
  if (!user) return { ok: false, message: "User not found." };
  if (user.role === "ADMIN") return { ok: false, message: "Admin accounts cannot be deactivated here." };

  await prisma.user.update({ where: { id: userId }, data: { isActive: !user.isActive } });
  revalidatePath("/dashboard/admin/agents");
  revalidatePath("/dashboard/admin/buyers");
  return { ok: true, message: user.isActive ? "Account deactivated." : "Account activated." };
}
