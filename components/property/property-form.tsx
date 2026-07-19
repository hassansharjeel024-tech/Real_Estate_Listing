"use client";
/**
 * One form for both create and edit. `initial` decides which server action runs,
 * so the field list, validation and layout never drift between the two screens.
 */
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/property/image-uploader";
import { useToast } from "@/components/ui/toast";
import { propertySchema, type PropertyInput } from "@/lib/validations";
import { createProperty, updateProperty } from "@/actions/properties";

type Option = { id: string; name: string };

const AMENITY_CHOICES = [
  "Lift", "Backup generator", "Solar panels", "Servant quarter", "Garden",
  "Rooftop terrace", "CCTV", "Gated security", "Gym", "Swimming pool",
  "Central heating", "Central cooling", "Corner plot", "Near park", "Near school",
];

export function PropertyForm({ cities, types, initial, propertyId }: {
  cities: Option[];
  types: Option[];
  initial?: Partial<PropertyInput>;
  propertyId?: string;
}) {
  const toast = useToast();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register, handleSubmit, control, watch, setValue,
    formState: { errors, isSubmitting },
  } = useForm<PropertyInput>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: "", description: "", price: 0, typeId: "", cityId: "", area: "", address: "",
      bedrooms: 0, bathrooms: 0, sizeSqft: 0, parking: 0, furnished: false,
      amenities: [], galleryImages: [], featuredImage: "", availability: "AVAILABLE",
      ...initial,
    },
  });

  const gallery = watch("galleryImages");
  const featuredImage = watch("featuredImage");
  const amenities = watch("amenities");

  async function onSubmit(values: PropertyInput) {
    setServerError(null);
    const result = propertyId
      ? await updateProperty(propertyId, values)
      : await createProperty(values);

    // A successful action redirects, so anything returned here is a failure.
    if (result && !result.ok) {
      setServerError(result.message);
      toast(result.message, "error");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <p role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {serverError}
        </p>
      )}

      <section className="card space-y-4 p-5">
        <h2 className="font-display text-lg">The basics</h2>

        <div>
          <label className="label" htmlFor="title">Listing title</label>
          <input id="title" className="input" placeholder="5 Marla modern house in Bahria Town Phase 7"
            aria-invalid={!!errors.title} {...register("title")} />
          {errors.title && <p className="field-error">{errors.title.message}</p>}
        </div>

        <div>
          <label className="label" htmlFor="description">Description</label>
          <textarea id="description" rows={6} className="input resize-y"
            placeholder="Describe the layout, condition, finishes and what's nearby."
            aria-invalid={!!errors.description} {...register("description")} />
          {errors.description && <p className="field-error">{errors.description.message}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="price">Price (PKR)</label>
            <input id="price" type="number" min={0} step={50000} className="input" {...register("price")} />
            {errors.price && <p className="field-error">{errors.price.message}</p>}
          </div>
          <div>
            <label className="label" htmlFor="typeId">Property type</label>
            <select id="typeId" className="input" {...register("typeId")}>
              <option value="">Choose one</option>
              {types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            {errors.typeId && <p className="field-error">{errors.typeId.message}</p>}
          </div>
          <div>
            <label className="label" htmlFor="availability">Availability</label>
            <select id="availability" className="input" {...register("availability")}>
              <option value="AVAILABLE">Available</option>
              <option value="UNDER_OFFER">Under offer</option>
              <option value="SOLD">Sold</option>
              <option value="RENTED">Rented</option>
            </select>
          </div>
        </div>
      </section>

      <section className="card space-y-4 p-5">
        <h2 className="font-display text-lg">Where it is</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="cityId">City</label>
            <select id="cityId" className="input" {...register("cityId")}>
              <option value="">Choose one</option>
              {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.cityId && <p className="field-error">{errors.cityId.message}</p>}
          </div>
          <div>
            <label className="label" htmlFor="area">Area</label>
            <input id="area" className="input" placeholder="Bahria Town Phase 7" {...register("area")} />
            {errors.area && <p className="field-error">{errors.area.message}</p>}
          </div>
          <div>
            <label className="label" htmlFor="address">Street address</label>
            <input id="address" className="input" placeholder="House 42, Street 11" {...register("address")} />
            {errors.address && <p className="field-error">{errors.address.message}</p>}
          </div>
        </div>
      </section>

      <section className="card space-y-4 p-5">
        <h2 className="font-display text-lg">Specification</h2>
        <div className="grid gap-4 sm:grid-cols-4">
          <div>
            <label className="label" htmlFor="bedrooms">Bedrooms</label>
            <input id="bedrooms" type="number" min={0} className="input" {...register("bedrooms")} />
          </div>
          <div>
            <label className="label" htmlFor="bathrooms">Bathrooms</label>
            <input id="bathrooms" type="number" min={0} className="input" {...register("bathrooms")} />
          </div>
          <div>
            <label className="label" htmlFor="sizeSqft">Covered area (sq ft)</label>
            <input id="sizeSqft" type="number" min={0} step={10} className="input" {...register("sizeSqft")} />
            {errors.sizeSqft && <p className="field-error">{errors.sizeSqft.message}</p>}
          </div>
          <div>
            <label className="label" htmlFor="parking">Parking spaces</label>
            <input id="parking" type="number" min={0} className="input" {...register("parking")} />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="h-4 w-4 rounded border-line accent-brand" {...register("furnished")} />
          Furnished
        </label>

        <fieldset>
          <legend className="label">Amenities</legend>
          <div className="flex flex-wrap gap-2">
            {AMENITY_CHOICES.map((amenity) => {
              const active = amenities.includes(amenity);
              return (
                <button key={amenity} type="button"
                  aria-pressed={active}
                  onClick={() => setValue("amenities",
                    active ? amenities.filter((a) => a !== amenity) : [...amenities, amenity],
                    { shouldDirty: true })}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    active ? "border-brand bg-brand/10 text-brand" : "border-line text-muted hover:border-brand"
                  }`}>
                  {amenity}
                </button>
              );
            })}
          </div>
        </fieldset>
      </section>

      <section className="card space-y-4 p-5">
        <h2 className="font-display text-lg">Photos</h2>
        <Controller
          control={control}
          name="galleryImages"
          render={({ field }) => (
            <ImageUploader
              value={field.value}
              onChange={field.onChange}
              featured={featuredImage || undefined}
              onFeaturedChange={(url) => setValue("featuredImage", url, { shouldDirty: true })}
            />
          )}
        />
        {gallery.length === 0 && (
          <p className="text-xs text-muted">Listings with photos get far more inquiries. Add at least one.</p>
        )}
      </section>

      <div className="flex items-center gap-3">
        <Button type="submit" loading={isSubmitting} size="lg">
          {propertyId ? "Save changes" : "Publish listing"}
        </Button>
        <p className="text-xs text-muted">
          An admin reviews every listing before it appears in search.
        </p>
      </div>
    </form>
  );
}
