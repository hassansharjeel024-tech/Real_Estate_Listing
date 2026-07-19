import type { Metadata } from "next";
import { PropertyForm } from "@/components/property/property-form";
import { getFilterOptions } from "@/lib/queries";
import { requireRole } from "@/lib/auth";

export const metadata: Metadata = { title: "Add a property" };

export default async function NewPropertyPage() {
  await requireRole("AGENT");
  const { cities, types } = await getFilterOptions();

  return (
    <>
      <h1 className="font-display text-3xl">Add a property</h1>
      <p className="mt-1 text-sm text-muted">
        Fill in what you know. You can edit everything later.
      </p>
      <div className="mt-6">
        <PropertyForm cities={cities} types={types} />
      </div>
    </>
  );
}
