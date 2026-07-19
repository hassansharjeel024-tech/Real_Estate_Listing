import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PropertyForm } from "@/components/property/property-form";
import { getFilterOptions } from "@/lib/queries";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Edit listing" };

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const agent = await requireRole("AGENT", "ADMIN");
  const { id } = await params;

  const property = await prisma.property.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
  // A 404 rather than a 403 — an agent has no business learning that another
  // agent's listing id exists.
  if (!property || (agent.role !== "ADMIN" && property.agentId !== agent.id)) notFound();

  const { cities, types } = await getFilterOptions();

  return (
    <>
      <h1 className="font-display text-3xl">Edit listing</h1>
      <p className="mt-1 text-sm text-muted">
        Saving sends the listing back for a quick review before it returns to search.
      </p>
      <div className="mt-6">
        <PropertyForm
          cities={cities}
          types={types}
          propertyId={property.id}
          initial={{
            title: property.title,
            description: property.description,
            price: property.price,
            typeId: property.typeId,
            cityId: property.cityId,
            area: property.area,
            address: property.address,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            sizeSqft: property.sizeSqft,
            parking: property.parking,
            furnished: property.furnished,
            amenities: property.amenities,
            featuredImage: property.featuredImage ?? "",
            galleryImages: property.images.map((i) => i.url),
            availability: property.availability,
          }}
        />
      </div>
    </>
  );
}
