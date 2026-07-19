/**
 * Database logic for listings. Route handlers and Server Components both call
 * these, so the "only approved listings from active agents are public" rule
 * lives in exactly one place.
 */
import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { PropertyFilter } from "@/lib/validations";

/** Fields the card component needs — nothing more, to keep payloads small. */
export const propertyCardSelect = {
  id: true,
  slug: true,
  title: true,
  price: true,
  area: true,
  bedrooms: true,
  bathrooms: true,
  sizeSqft: true,
  featuredImage: true,
  isFeatured: true,
  availability: true,
  status: true,
  createdAt: true,
  city: { select: { name: true, slug: true } },
  type: { select: { name: true, slug: true } },
} satisfies Prisma.PropertySelect;

export const PUBLIC_WHERE: Prisma.PropertyWhereInput = {
  status: "APPROVED",
  agent: { isActive: true },
};

function buildWhere(f: PropertyFilter): Prisma.PropertyWhereInput {
  const where: Prisma.PropertyWhereInput = { ...PUBLIC_WHERE };

  if (f.q) {
    where.OR = [
      { title: { contains: f.q, mode: "insensitive" } },
      { area: { contains: f.q, mode: "insensitive" } },
      { description: { contains: f.q, mode: "insensitive" } },
      { city: { name: { contains: f.q, mode: "insensitive" } } },
    ];
  }
  if (f.city) where.city = { slug: f.city };
  if (f.type) where.type = { slug: f.type };
  if (f.minPrice != null || f.maxPrice != null) {
    where.price = { gte: f.minPrice ?? undefined, lte: f.maxPrice ?? undefined };
  }
  if (f.minSize != null || f.maxSize != null) {
    where.sizeSqft = { gte: f.minSize ?? undefined, lte: f.maxSize ?? undefined };
  }
  // Bedroom/bathroom pickers are "N or more", which is how buyers read them.
  if (f.bedrooms != null) where.bedrooms = { gte: f.bedrooms };
  if (f.bathrooms != null) where.bathrooms = { gte: f.bathrooms };
  if (f.featured === "true") where.isFeatured = true;

  return where;
}

function buildOrderBy(sort: PropertyFilter["sort"]): Prisma.PropertyOrderByWithRelationInput[] {
  switch (sort) {
    case "price_asc": return [{ price: "asc" }];
    case "price_desc": return [{ price: "desc" }];
    case "size_desc": return [{ sizeSqft: "desc" }];
    default: return [{ isFeatured: "desc" }, { createdAt: "desc" }];
  }
}

export async function searchProperties(filter: PropertyFilter) {
  const where = buildWhere(filter);
  const skip = (filter.page - 1) * filter.perPage;

  const [items, total] = await Promise.all([
    prisma.property.findMany({
      where,
      select: propertyCardSelect,
      orderBy: buildOrderBy(filter.sort),
      skip,
      take: filter.perPage,
    }),
    prisma.property.count({ where }),
  ]);

  return {
    items,
    total,
    page: filter.page,
    perPage: filter.perPage,
    totalPages: Math.max(1, Math.ceil(total / filter.perPage)),
  };
}

/** Full detail payload for /properties/[id]. Accepts an id or a slug. */
export async function getPropertyDetail(idOrSlug: string) {
  return prisma.property.findFirst({
    where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
    include: {
      city: true,
      type: true,
      images: { orderBy: { sortOrder: "asc" } },
      agent: {
        select: {
          id: true, name: true, email: true, phone: true, isActive: true,
          agentProfile: true,
          _count: { select: { properties: { where: { status: "APPROVED" } } } },
        },
      },
    },
  });
}

/** Same city + same type, cheapest signal of relevance without a search index. */
export async function getRelatedProperties(property: { id: string; cityId: string; typeId: string }) {
  return prisma.property.findMany({
    where: {
      ...PUBLIC_WHERE,
      id: { not: property.id },
      OR: [{ cityId: property.cityId }, { typeId: property.typeId }],
    },
    select: propertyCardSelect,
    orderBy: { createdAt: "desc" },
    take: 3,
  });
}

export async function getFilterOptions() {
  const [cities, types] = await Promise.all([
    prisma.city.findMany({ orderBy: { name: "asc" } }),
    prisma.propertyType.findMany({ orderBy: { name: "asc" } }),
  ]);
  return { cities, types };
}

export async function getAdminStats() {
  const [properties, pending, agents, buyers, inquiries, byCity, recent] = await Promise.all([
    prisma.property.count(),
    prisma.property.count({ where: { status: "PENDING" } }),
    prisma.user.count({ where: { role: "AGENT" } }),
    prisma.user.count({ where: { role: "BUYER" } }),
    prisma.inquiry.count(),
    prisma.property.groupBy({ by: ["cityId"], _count: { _all: true }, orderBy: { _count: { cityId: "desc" } }, take: 6 }),
    prisma.property.findMany({
      select: propertyCardSelect,
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const cityNames = await prisma.city.findMany({
    where: { id: { in: byCity.map((c) => c.cityId) } },
    select: { id: true, name: true },
  });

  return {
    totals: { properties, pending, agents, buyers, inquiries },
    byCity: byCity.map((row) => ({
      city: cityNames.find((c) => c.id === row.cityId)?.name ?? "Unknown",
      count: row._count._all,
    })),
    recent,
  };
}
