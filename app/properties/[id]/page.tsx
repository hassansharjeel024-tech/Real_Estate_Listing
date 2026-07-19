import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Bath, BedDouble, Building, Car, Check, MapPin, Ruler, Sofa } from "lucide-react";
import { ImageGallery } from "@/components/property/image-gallery";
import { InquiryForm } from "@/components/property/inquiry-form";
import { PropertyCard } from "@/components/property/property-card";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { getPropertyDetail, getRelatedProperties } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { formatDate, formatPrice, initials } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const property = await getPropertyDetail(id);
  if (!property) return { title: "Listing not found" };
  return {
    title: property.title,
    description: property.description.slice(0, 155),
    openGraph: { images: property.featuredImage ? [property.featuredImage] : [] },
  };
}

export default async function PropertyDetailPage({ params }: Props) {
  const { id } = await params;
  const [property, user] = await Promise.all([getPropertyDetail(id), getCurrentUser()]);
  if (!property) notFound();

  // Unapproved listings stay private to their agent and to admins.
  const isOwner = user?.id === property.agentId;
  const isAdmin = user?.role === "ADMIN";
  if (property.status !== "APPROVED" && !isOwner && !isAdmin) notFound();

  const related = await getRelatedProperties(property);
  const agentProfile = property.agent.agentProfile;

  // The gallery always leads with the featured image.
  const galleryImages = property.featuredImage
    ? [
        { id: "featured", url: property.featuredImage, alt: property.title },
        ...property.images.filter((i) => i.url !== property.featuredImage),
      ]
    : property.images;

  const specs = [
    { icon: BedDouble, label: "Bedrooms", value: property.bedrooms },
    { icon: Bath, label: "Bathrooms", value: property.bathrooms },
    { icon: Ruler, label: "Covered area", value: `${property.sizeSqft.toLocaleString()} sq ft` },
    { icon: Car, label: "Parking", value: property.parking || "None" },
    { icon: Building, label: "Type", value: property.type.name },
    { icon: Sofa, label: "Furnished", value: property.furnished ? "Yes" : "No" },
  ];

  return (
    <div className="container-page py-8">
      {property.status !== "APPROVED" && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-accent/40 bg-accent/10 px-4 py-3 text-sm">
          <StatusBadge status={property.status} />
          <span className="text-ink">
            {property.status === "PENDING"
              ? "Only you and the admin team can see this listing while it is in review."
              : `Rejected: ${property.rejectionNote ?? "no reason recorded"}`}
          </span>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <ImageGallery images={galleryImages} title={property.title} />

          <header className="mt-6">
            <div className="flex flex-wrap items-center gap-2">
              {property.isFeatured && <Badge tone="accent">Featured</Badge>}
              <Badge tone={property.availability === "AVAILABLE" ? "success" : "neutral"}>
                {property.availability.replace("_", " ").toLowerCase()}
              </Badge>
              <span className="text-xs text-muted">Listed {formatDate(property.createdAt)}</span>
            </div>

            <h1 className="mt-3 font-display text-3xl leading-tight">{property.title}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
              <MapPin className="h-4 w-4" /> {property.address}, {property.area}, {property.city.name}
            </p>
            <p className="mt-4 font-display text-4xl text-brand">{formatPrice(property.price)}</p>
          </header>

          <section className="mt-8">
            <h2 className="font-display text-xl">Property information</h2>
            <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {specs.map((spec) => (
                <div key={spec.label} className="card p-4">
                  <dt className="flex items-center gap-1.5 text-xs text-muted">
                    <spec.icon className="h-3.5 w-3.5" /> {spec.label}
                  </dt>
                  <dd className="mt-1 font-medium">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-8">
            <h2 className="font-display text-xl">About this property</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-muted">{property.description}</p>
          </section>

          {property.amenities.length > 0 && (
            <section className="mt-8">
              <h2 className="font-display text-xl">Amenities</h2>
              <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {property.amenities.map((amenity) => (
                  <li key={amenity} className="flex items-center gap-2 text-sm text-muted">
                    <Check className="h-4 w-4 text-brand" /> {amenity}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">Listed by</h2>
            <Link href={`/agents/${property.agent.id}`} className="mt-3 flex items-center gap-3 group">
              {agentProfile?.photoUrl ? (
                <Image src={agentProfile.photoUrl} alt="" width={48} height={48}
                  className="h-12 w-12 rounded-full object-cover" />
              ) : (
                <span className="grid h-12 w-12 place-items-center rounded-full bg-brand/10 font-semibold text-brand">
                  {initials(property.agent.name)}
                </span>
              )}
              <div>
                <p className="font-medium group-hover:text-brand">{property.agent.name}</p>
                <p className="text-xs text-muted">
                  {agentProfile?.company ?? "Independent agent"} ·{" "}
                  {property.agent._count.properties} active {property.agent._count.properties === 1 ? "listing" : "listings"}
                </p>
              </div>
            </Link>
          </div>

          <InquiryForm
            propertyId={property.id}
            canInquire={user?.role === "BUYER" && !isOwner}
            reason={
              !user ? "Sign in as a buyer to send an inquiry."
              : isOwner ? "This is your own listing."
              : user.role !== "BUYER" ? "Only buyer accounts can send inquiries."
              : undefined
            }
          />
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl">Related listings</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => <PropertyCard key={item.id} property={item} />)}
          </div>
        </section>
      )}
    </div>
  );
}
