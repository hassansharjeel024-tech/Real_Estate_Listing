"use server";
/** Save/unsave a listing. The unique constraint on (userId, propertyId) makes
 *  this safe against double-clicks without an explicit lock. */
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function toggleFavorite(propertyId: string) {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Sign in to save listings.", saved: false };

  const existing = await prisma.favorite.findUnique({
    where: { userId_propertyId: { userId: user.id, propertyId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    revalidatePath("/favorites");
    return { ok: true, message: "Removed from saved.", saved: false };
  }

  await prisma.favorite.create({ data: { userId: user.id, propertyId } });
  revalidatePath("/favorites");
  return { ok: true, message: "Saved.", saved: true };
}
