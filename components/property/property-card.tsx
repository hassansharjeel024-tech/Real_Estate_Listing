import Image from "next/image";
import Link from "next/link";
import { Bath, BedDouble, Ruler } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/property/favorite-button";
import { formatPrice } from "@/lib/utils";
import type { PropertyCard as PropertyCardType } from "@/types";

/**
 * The unit of the whole product. Price leads because it is the first thing a
 * buyer filters on; the rest is a single scannable spec line.
 */
export function PropertyCard({ property, saved }: { property: PropertyCardType; saved?: boolean }) {
  return (
    <article className="card group overflow-hidden transition-shadow hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden bg-line/40">
        {property.featuredImage ? (
          <Image
            src={property.featuredImage}
            alt={property.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-xs text-muted">No photo yet</div>
        )}

        <div className="absolute left-3 top-3 flex gap-2">
          {property.isFeatured && <Badge tone="accent">Featured</Badge>}
          {property.availability !== "AVAILABLE" && (
            <Badge tone="neutral">{property.availability.replace("_", " ").toLowerCase()}</Badge>
          )}
        </div>
        <div className="absolute right-3 top-3">
          <FavoriteButton propertyId={property.id} initialSaved={saved} />
        </div>
      </div>

      <div className="p-4">
        <p className="font-display text-xl text-ink">{formatPrice(property.price)}</p>
        <Link href={`/properties/${property.slug}`} className="mt-1 block">
          <h3 className="line-clamp-1 font-medium text-ink hover:text-brand">{property.title}</h3>
        </Link>
        <p className="mt-0.5 line-clamp-1 text-sm text-muted">
          {property.area}, {property.city.name}
        </p>

        <dl className="mt-3 flex items-center gap-4 border-t border-line pt-3 text-sm text-muted">
          <div className="flex items-center gap-1.5">
            <BedDouble className="h-4 w-4" aria-hidden />
            <dt className="sr-only">Bedrooms</dt>
            <dd>{property.bedrooms}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="h-4 w-4" aria-hidden />
            <dt className="sr-only">Bathrooms</dt>
            <dd>{property.bathrooms}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Ruler className="h-4 w-4" aria-hidden />
            <dt className="sr-only">Covered area</dt>
            <dd>{property.sizeSqft.toLocaleString()} sq ft</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}
