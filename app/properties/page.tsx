import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SearchX } from "lucide-react";
import { PropertyFilters } from "@/components/property/property-filters";
import { PropertyCard } from "@/components/property/property-card";
import { EmptyState, PropertyCardSkeleton, Skeleton } from "@/components/ui/states";
import { getFilterOptions, searchProperties } from "@/lib/queries";
import { propertyFilterSchema } from "@/lib/validations";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Search listings" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Results are a separate component so the filter bar renders instantly. */
async function Results({ searchParams }: { searchParams: SearchParams }) {
  const raw = await searchParams;
  // Bad query strings should show an unfiltered page, not a crash.
  const parsed = propertyFilterSchema.safeParse(raw);
  const filter = parsed.success ? parsed.data : propertyFilterSchema.parse({});

  const [{ items, total, page, totalPages }, user] = await Promise.all([
    searchProperties(filter),
    getCurrentUser(),
  ]);

  const savedIds = user
    ? (await prisma.favorite.findMany({
        where: { userId: user.id, propertyId: { in: items.map((i) => i.id) } },
        select: { propertyId: true },
      })).map((f) => f.propertyId)
    : [];

  if (items.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title="No listings match those filters"
        body="Widen the price range or clear a filter to see more of what's available."
        action={{ href: "/properties", label: "Clear all filters" }}
      />
    );
  }

  const query = new URLSearchParams(
    Object.entries(raw).filter(([k, v]) => k !== "page" && typeof v === "string") as [string, string][],
  );

  return (
    <>
      <p className="mb-4 text-sm text-muted">
        {total.toLocaleString()} {total === 1 ? "listing" : "listings"} · page {page} of {totalPages}
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((property) => (
          <PropertyCard key={property.id} property={property} saved={savedIds.includes(property.id)} />
        ))}
      </div>

      {totalPages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
          {Array.from({ length: totalPages }).slice(0, 10).map((_, i) => {
            const n = i + 1;
            query.set("page", String(n));
            return (
              <Link key={n} href={`/properties?${query.toString()}`}
                aria-current={n === page ? "page" : undefined}
                className={`grid h-9 w-9 place-items-center rounded-lg text-sm ${
                  n === page ? "bg-brand text-white" : "border border-line hover:border-brand"
                }`}>
                {n}
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}

export default async function PropertiesPage({ searchParams }: { searchParams: SearchParams }) {
  const { cities, types } = await getFilterOptions();

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-3xl">Search listings</h1>
      <p className="mt-1 text-sm text-muted">Filters update the results and the URL, so you can share a search.</p>

      <div className="mt-6">
        <Suspense fallback={<Skeleton className="h-20 w-full" />}>
          <PropertyFilters cities={cities} types={types} />
        </Suspense>
      </div>

      <div className="mt-8">
        <Suspense fallback={
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
          </div>
        }>
          <Results searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
