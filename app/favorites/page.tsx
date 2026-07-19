import type { Metadata } from "next";
import { Heart } from "lucide-react";
import { PropertyCard } from "@/components/property/property-card";
import { EmptyState } from "@/components/ui/states";
import { prisma } from "@/lib/prisma";
import { propertyCardSelect } from "@/lib/queries";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Saved listings" };

export default async function FavoritesPage() {
  const user = await requireUser();
  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id, property: { status: "APPROVED" } },
    orderBy: { createdAt: "desc" },
    select: { property: { select: propertyCardSelect } },
  });

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-3xl">Saved listings</h1>
      <p className="mt-1 text-sm text-muted">Only you can see this list.</p>

      <div className="mt-8">
        {favorites.length === 0 ? (
          <EmptyState icon={Heart} title="Nothing saved yet"
            body="Tap the heart on any listing and it will show up here."
            action={{ href: "/properties", label: "Start browsing" }} />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map(({ property }) => (
              <PropertyCard key={property.id} property={property} saved />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
