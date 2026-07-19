/**
 * POST /api/inquiries — a buyer contacts an agent about a listing
 * GET  /api/inquiries — agent sees inquiries on their listings;
 *                       admin sees everything; buyer sees their own
 */
import type { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ApiError, authorize, handleError, ok } from "@/lib/api";
import { inquirySchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const session = await authorize("BUYER");
    const body = inquirySchema.parse(await request.json());

    const property = await prisma.property.findFirst({
      where: { id: body.propertyId, status: "APPROVED" },
      select: { id: true, agentId: true },
    });
    if (!property) throw new ApiError("Listing not found.", 404);
    if (property.agentId === session.userId) {
      throw new ApiError("You cannot inquire about your own listing.", 400);
    }

    // Light rate limit: one inquiry per buyer per listing per hour.
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recent = await prisma.inquiry.findFirst({
      where: { buyerId: session.userId, propertyId: property.id, createdAt: { gte: hourAgo } },
    });
    if (recent) throw new ApiError("You already contacted this agent recently.", 429);

    const inquiry = await prisma.inquiry.create({
      data: {
        propertyId: property.id,
        buyerId: session.userId,
        message: body.message,
        contactPreference: body.contactPreference || null,
      },
      select: { id: true, createdAt: true },
    });

    return ok(inquiry, 201);
  } catch (error) {
    return handleError(error);
  }
}

export async function GET() {
  try {
    const session = await authorize("AGENT", "ADMIN", "BUYER");

    // Scope the query by role rather than filtering after the fetch.
    const where: Prisma.InquiryWhereInput =
      session.role === "ADMIN" ? {}
      : session.role === "AGENT" ? { property: { agentId: session.userId } }
      : { buyerId: session.userId };

    const inquiries = await prisma.inquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        property: { select: { id: true, slug: true, title: true, featuredImage: true } },
        // `phone` is deliberately excluded: buyers contact agents without
        // handing over their number unless they type it in the message.
        buyer: { select: { id: true, name: true, email: true } },
      },
    });

    return ok(inquiries);
  } catch (error) {
    return handleError(error);
  }
}
