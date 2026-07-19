import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Building2 } from "lucide-react";
import { PropertyCard } from "@/components/property/property-card";
import { PropertyCardSkeleton } from "@/components/ui/states";
import { Button } from "@/components/ui/button";
import { searchProperties, getFilterOptions } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { propertyFilterSchema } from "@/lib/validations";

export const revalidate = 60;

/**
 * Hero thesis: the search box is the product, so it is the first thing on the
 * page — no stock photography of a couple holding keys.
 */
async function FeaturedGrid() {
  const { items } = await searchProperties(
    propertyFilterSchema.parse({ featured: "true", perPage: "6" }),
  );

  if (items.length === 0) {
    return <p className="text-sm text-muted">No featured listings right now. Browse everything instead.</p>;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((property) => <PropertyCard key={property.id} property={property} />)}
    </div>
  );
}

export default async function HomePage() {
  const [{ cities }, counts] = await Promise.all([
    getFilterOptions(),
    prisma.property.count({ where: { status: "APPROVED" } }),
  ]);

  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="container-page py-16 sm:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            {counts.toLocaleString()} listings · reviewed before publishing
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl">
            Every property on this page has been checked by a person.
          </h1>
          <p className="mt-4 max-w-xl text-muted">
            Search by city, price and size. Message the agent without handing over
            your phone number.
          </p>

          <form action="/properties" className="mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row">
            <input
              name="q"
              placeholder="Try “Bahria Town” or “3 bed apartment”"
              aria-label="Search listings"
              className="input h-12 flex-1"
            />
            <select name="city" aria-label="City" className="input h-12 sm:w-44">
              <option value="">Any city</option>
              {cities.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
            <Button type="submit" size="lg">Search</Button>
          </form>

          <div className="mt-6 flex flex-wrap gap-2">
            {cities.slice(0, 6).map((city) => (
              <Link key={city.id} href={`/properties?city=${city.slug}`}
                className="rounded-full border border-line px-3 py-1 text-xs text-muted hover:border-brand hover:text-brand">
                {city.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl">Featured listings</h2>
            <p className="mt-1 text-sm text-muted">Picked by our team from this week's submissions.</p>
          </div>
          <Link href="/properties" className="flex items-center gap-1 text-sm font-medium text-brand hover:underline">
            See all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <Suspense fallback={
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
          </div>
        }>
          <FeaturedGrid />
        </Suspense>
      </section>

      <section className="container-page pb-16">
        <div className="card flex flex-col items-start justify-between gap-4 p-8 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-2xl">Are you an agent?</h2>
            <p className="mt-1 max-w-md text-sm text-muted">
              Publish listings, upload galleries and manage every inquiry from one dashboard.
            </p>
          </div>
          <Link href="/register?role=AGENT">
            <Button size="lg"><Building2 className="h-4 w-4" /> Join as an agent</Button>
          </Link>
        </div>
      </section>
    </>
  );
}
