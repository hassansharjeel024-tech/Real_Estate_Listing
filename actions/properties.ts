"use server";
/** Agent-facing listing mutations used by the dashboard forms. */
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { deleteImage } from "@/lib/blob";
import { propertySchema } from "@/lib/validations";
import { uniqueSlug } from "@/lib/utils";
import type { PropertyInput } from "@/lib/validations";

export type FormResult = { ok: boolean; message: string; fieldErrors?: Record<string, string[]> };

export async function createProperty(input: PropertyInput): Promise<FormResult> {
  const agent = await requireRole("AGENT", "ADMIN");
  const parsed = propertySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Fix the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { galleryImages, ...fields } = parsed.data;
  await prisma.property.create({
    data: {
      ...fields,
      featuredImage: fields.featuredImage || galleryImages[0] || null,
      slug: uniqueSlug(fields.title),
      agentId: agent.id,
      images: { create: galleryImages.map((url, i) => ({ url, sortOrder: i })) },
    },
  });

  revalidatePath("/dashboard/agent");
  redirect("/dashboard/agent?created=1");
}

export async function updateProperty(id: string, input: PropertyInput): Promise<FormResult> {
  const agent = await requireRole("AGENT", "ADMIN");
  const parsed = propertySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Fix the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const existing = await prisma.property.findUnique({ where: { id }, select: { agentId: true } });
  if (!existing) return { ok: false, message: "Listing not found." };
  if (agent.role !== "ADMIN" && existing.agentId !== agent.id) {
    return { ok: false, message: "This listing belongs to another agent." };
  }

  const { galleryImages, ...fields } = parsed.data;
  await prisma.$transaction([
    prisma.propertyImage.deleteMany({ where: { propertyId: id } }),
    prisma.propertyImage.createMany({
      data: galleryImages.map((url, i) => ({ propertyId: id, url, sortOrder: i })),
    }),
    prisma.property.update({
      where: { id },
      data: {
        ...fields,
        featuredImage: fields.featuredImage || galleryImages[0] || null,
        ...(agent.role === "AGENT" ? { status: "PENDING", rejectionNote: null } : {}),
      },
    }),
  ]);

  revalidatePath("/dashboard/agent");
  revalidatePath(`/properties/${id}`);
  redirect("/dashboard/agent?updated=1");
}

export async function deleteProperty(id: string): Promise<FormResult> {
  const agent = await requireRole("AGENT", "ADMIN");
  const existing = await prisma.property.findUnique({ where: { id }, select: { agentId: true } });
  if (!existing) return { ok: false, message: "Listing not found." };
  if (agent.role !== "ADMIN" && existing.agentId !== agent.id) {
    return { ok: false, message: "This listing belongs to another agent." };
  }

  const images = await prisma.propertyImage.findMany({ where: { propertyId: id } });
  await prisma.property.delete({ where: { id } });
  await Promise.all(images.map((image) => deleteImage(image.url)));

  revalidatePath("/dashboard/agent");
  return { ok: true, message: "Listing deleted." };
}
