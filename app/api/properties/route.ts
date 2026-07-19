/**
 * GET  /api/properties  — public, filtered, paginated search
 * POST /api/properties  — agents create a listing (enters moderation as PENDING)
 */
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize, handleError, ok } from "@/lib/api";
import { propertyFilterSchema, propertySchema } from "@/lib/validations";
import { searchProperties } from "@/lib/queries";
import { uniqueSlug } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const raw = Object.fromEntries(request.nextUrl.searchParams);
    const filter = propertyFilterSchema.parse(raw);
    return ok(await searchProperties(filter));
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await authorize("AGENT", "ADMIN");
    const body = propertySchema.parse(await request.json());
    const { galleryImages, ...fields } = body;

    const property = await prisma.property.create({
      data: {
        ...fields,
        featuredImage: fields.featuredImage || galleryImages[0] || null,
        slug: uniqueSlug(fields.title),
        agentId: session.userId,
        status: "PENDING", // never trust a client-supplied status
        images: {
          create: galleryImages.map((url, index) => ({ url, sortOrder: index })),
        },
      },
      select: { id: true, slug: true, status: true },
    });

    return ok(property, 201);
  } catch (error) {
    return handleError(error);
  }
}
