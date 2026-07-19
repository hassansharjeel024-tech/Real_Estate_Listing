/**
 * GET    /api/properties/:id  — detail (drafts visible only to owner/admin)
 * PUT    /api/properties/:id  — owner or admin edits; edits reset moderation
 * DELETE /api/properties/:id  — owner or admin removes the listing
 */
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, authorize, handleError, ok } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { getPropertyDetail } from "@/lib/queries";
import { propertyUpdateSchema } from "@/lib/validations";
import { deleteImage } from "@/lib/blob";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const property = await getPropertyDetail(id);
    if (!property) throw new ApiError("Listing not found.", 404);

    // Unapproved listings are private to their agent and to admins.
    if (property.status !== "APPROVED") {
      const session = await getSession();
      const allowed = session && (session.role === "ADMIN" || session.userId === property.agentId);
      if (!allowed) throw new ApiError("Listing not found.", 404);
    }
    return ok(property);
  } catch (error) {
    return handleError(error);
  }
}

/** Loads the listing and asserts the caller may change it. */
async function assertOwnership(id: string) {
  const session = await authorize("AGENT", "ADMIN");
  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) throw new ApiError("Listing not found.", 404);
  if (session.role !== "ADMIN" && property.agentId !== session.userId) {
    throw new ApiError("This listing belongs to another agent.", 403);
  }
  return { session, property };
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const { session } = await assertOwnership(id);
    const body = propertyUpdateSchema.parse(await request.json());
    const { galleryImages, ...fields } = body;

    const updated = await prisma.$transaction(async (tx) => {
      if (galleryImages) {
        // Replace the gallery wholesale — simpler and idempotent compared to
        // diffing, and the image count per listing is small.
        await tx.propertyImage.deleteMany({ where: { propertyId: id } });
        await tx.propertyImage.createMany({
          data: galleryImages.map((url, index) => ({ propertyId: id, url, sortOrder: index })),
        });
      }
      return tx.property.update({
        where: { id },
        data: {
          ...fields,
          // An agent editing an approved listing sends it back for review.
          // An admin editing it does not.
          ...(session.role === "AGENT" ? { status: "PENDING", rejectionNote: null } : {}),
        },
        select: { id: true, slug: true, status: true },
      });
    });

    return ok(updated);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    await assertOwnership(id);

    const images = await prisma.propertyImage.findMany({ where: { propertyId: id } });
    // Cascade removes images/inquiries/favorites rows; blobs need explicit cleanup.
    await prisma.property.delete({ where: { id } });
    await Promise.all(images.map((image) => deleteImage(image.url)));

    return ok({ deleted: true });
  } catch (error) {
    return handleError(error);
  }
}
