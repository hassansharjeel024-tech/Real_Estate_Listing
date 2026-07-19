import type { Prisma } from "@prisma/client";
import type { propertyCardSelect } from "@/lib/queries";

export type PropertyCard = Prisma.PropertyGetPayload<{ select: typeof propertyCardSelect }>;

export type PropertyDetail = Prisma.PropertyGetPayload<{
  include: {
    city: true;
    type: true;
    images: true;
    agent: {
      select: {
        id: true; name: true; email: true; phone: true; isActive: true;
        agentProfile: true;
        _count: { select: { properties: true } };
      };
    };
  };
}>;

export type ApiSuccess<T> = { success: true; data: T };
export type ApiFailure = { success: false; error: string; details?: unknown };
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
