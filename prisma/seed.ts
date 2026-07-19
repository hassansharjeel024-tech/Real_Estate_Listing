/**
 * Seeds cities, property types, one admin, two agents, one buyer and a handful
 * of listings so the portal is explorable on first run.
 * Run with: npm run db:seed  (idempotent — safe to run repeatedly)
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CITIES = [
  { name: "Islamabad", slug: "islamabad", province: "ICT" },
  { name: "Rawalpindi", slug: "rawalpindi", province: "Punjab" },
  { name: "Lahore", slug: "lahore", province: "Punjab" },
  { name: "Karachi", slug: "karachi", province: "Sindh" },
  { name: "Faisalabad", slug: "faisalabad", province: "Punjab" },
  { name: "Peshawar", slug: "peshawar", province: "KPK" },
];

const TYPES = [
  { name: "House", slug: "house" },
  { name: "Apartment", slug: "apartment" },
  { name: "Plot", slug: "plot" },
  { name: "Shop", slug: "shop" },
  { name: "Office", slug: "office" },
];

// Free Unsplash URLs — no key, no paid API.
const PHOTOS = [
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80",
];

async function main() {
  console.log("Seeding…");

  const cities = await Promise.all(
    CITIES.map((city) =>
      prisma.city.upsert({ where: { slug: city.slug }, update: {}, create: city }),
    ),
  );
  const types = await Promise.all(
    TYPES.map((type) =>
      prisma.propertyType.upsert({ where: { slug: type.slug }, update: {}, create: type }),
    ),
  );

  const password = await bcrypt.hash("Password123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@meridian.test" },
    update: {},
    create: { email: "admin@meridian.test", name: "Ayesha Khan", role: "ADMIN", passwordHash: password },
  });

  const agentOne = await prisma.user.upsert({
    where: { email: "agent@meridian.test" },
    update: {},
    create: {
      email: "agent@meridian.test", name: "Bilal Ahmed", role: "AGENT",
      phone: "+92 300 1112233", passwordHash: password,
      agentProfile: {
        create: {
          company: "Skyline Estates", licenseNo: "PK-ISB-2291",
          bio: "Twelve years across Islamabad and Rawalpindi. I mostly handle family homes in DHA and Bahria Town.",
          photoUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80",
        },
      },
    },
  });

  const agentTwo = await prisma.user.upsert({
    where: { email: "agent2@meridian.test" },
    update: {},
    create: {
      email: "agent2@meridian.test", name: "Sana Malik", role: "AGENT",
      phone: "+92 321 4445566", passwordHash: password,
      agentProfile: { create: { company: "Coast & Co", bio: "Karachi apartments and commercial space." } },
    },
  });

  const buyer = await prisma.user.upsert({
    where: { email: "buyer@meridian.test" },
    update: {},
    create: {
      email: "buyer@meridian.test", name: "Hamza Iqbal", role: "BUYER",
      phone: "+92 333 7778899", passwordHash: password,
      buyerProfile: { create: { preferredCity: "Islamabad", budgetMin: 10_000_000, budgetMax: 40_000_000 } },
    },
  });

  const seedListings = [
    {
      slug: "modern-5-marla-bahria-phase-7",
      title: "Modern 5 marla house in Bahria Town Phase 7",
      description:
        "A well-kept 5 marla house on a quiet street, two minutes from the main boulevard. Double-height lounge, open kitchen with fitted cabinets, and a small lawn at the back. Both upper bedrooms have attached baths and built-in wardrobes. Backup generator wiring is already in place.",
      price: 24_500_000, city: "islamabad", type: "house", area: "Bahria Town Phase 7",
      address: "House 42, Street 11", bedrooms: 4, bathrooms: 4, sizeSqft: 1_125, parking: 2,
      furnished: false, amenities: ["Backup generator", "Gated security", "CCTV", "Near park"],
      agentId: agentOne.id, status: "APPROVED" as const, isFeatured: true,
    },
    {
      slug: "2-bed-apartment-gulberg-greens",
      title: "Two bed apartment with a balcony in Gulberg Greens",
      description:
        "Third-floor apartment in a low-rise block with a lift and 24-hour security. Both bedrooms face the courtyard so the road noise stays out. Kitchen appliances stay with the property. Maintenance is settled through to the end of the year.",
      price: 9_800_000, city: "islamabad", type: "apartment", area: "Gulberg Greens",
      address: "Block C, Apartment 304", bedrooms: 2, bathrooms: 2, sizeSqft: 1_050, parking: 1,
      furnished: true, amenities: ["Lift", "Gated security", "CCTV", "Central cooling"],
      agentId: agentOne.id, status: "APPROVED" as const, isFeatured: true,
    },
    {
      slug: "10-marla-dha-phase-2-rawalpindi",
      title: "Ten marla corner house in DHA Phase 2",
      description:
        "Corner plot with light on three sides. Ground floor has a drawing room, dining area and a bedroom with attached bath; three more bedrooms upstairs. Servant quarter with a separate entrance at the rear. Roof is finished and waterproofed.",
      price: 42_000_000, city: "rawalpindi", type: "house", area: "DHA Phase 2",
      address: "House 7, Street 44, Sector B", bedrooms: 5, bathrooms: 5, sizeSqft: 2_250, parking: 3,
      furnished: false, amenities: ["Corner plot", "Servant quarter", "Garden", "Backup generator", "Near school"],
      agentId: agentOne.id, status: "APPROVED" as const, isFeatured: false,
    },
    {
      slug: "sea-facing-3-bed-clifton",
      title: "Sea-facing three bed apartment in Clifton Block 2",
      description:
        "Eighth floor with an uninterrupted view over the water. Marble flooring throughout, a large lounge that opens onto the terrace, and a separate family lounge. Building has two lifts, standby power and parking for two cars.",
      price: 68_000_000, city: "karachi", type: "apartment", area: "Clifton Block 2",
      address: "Seaview Towers, Flat 802", bedrooms: 3, bathrooms: 4, sizeSqft: 2_600, parking: 2,
      furnished: true, amenities: ["Lift", "Gym", "Swimming pool", "Gated security", "Backup generator"],
      agentId: agentTwo.id, status: "APPROVED" as const, isFeatured: true,
    },
    {
      slug: "commercial-shop-tariq-road",
      title: "Ground floor commercial shop on Tariq Road",
      description:
        "Roadside shop with a full glass front and a mezzanine that works as storage or a small office. High footfall through the evening. Currently vacant and available immediately.",
      price: 31_000_000, city: "karachi", type: "shop", area: "Tariq Road",
      address: "Shop 3, Rehman Plaza", bedrooms: 0, bathrooms: 1, sizeSqft: 620, parking: 0,
      furnished: false, amenities: ["CCTV", "Backup generator"],
      agentId: agentTwo.id, status: "APPROVED" as const, isFeatured: false,
    },
    {
      slug: "1-kanal-plot-lake-city-lahore",
      title: "One kanal residential plot in Lake City Sector M-3",
      description:
        "Level plot on a 40-foot road, all dues cleared and possession available. Utilities are laid to the boundary. Sector is largely built up, so construction can start straight away.",
      price: 38_500_000, city: "lahore", type: "plot", area: "Lake City Sector M-3",
      address: "Plot 214, Street 9", bedrooms: 0, bathrooms: 0, sizeSqft: 5_445, parking: 0,
      furnished: false, amenities: ["Gated security", "Near park"],
      agentId: agentTwo.id, status: "PENDING" as const, isFeatured: false,
    },
  ];

  for (const [index, listing] of seedListings.entries()) {
    const cityId = cities.find((c) => c.slug === listing.city)!.id;
    const typeId = types.find((t) => t.slug === listing.type)!.id;
    const featured = PHOTOS[index % PHOTOS.length];
    const gallery = [featured, PHOTOS[(index + 1) % PHOTOS.length], PHOTOS[(index + 2) % PHOTOS.length]];
    const { city, type, ...rest } = listing;

    await prisma.property.upsert({
      where: { slug: listing.slug },
      update: {},
      create: {
        ...rest,
        cityId,
        typeId,
        featuredImage: featured,
        images: { create: gallery.map((url, i) => ({ url, sortOrder: i })) },
      },
    });
  }

  const firstListing = await prisma.property.findUnique({ where: { slug: "modern-5-marla-bahria-phase-7" } });
  if (firstListing) {
    const existing = await prisma.inquiry.findFirst({
      where: { buyerId: buyer.id, propertyId: firstListing.id },
    });
    if (!existing) {
      await prisma.inquiry.create({
        data: {
          buyerId: buyer.id,
          propertyId: firstListing.id,
          message: "Is the price negotiable, and could I view it on Saturday morning?",
          contactPreference: "Email, or call after 6pm",
        },
      });
    }
  }

  console.log(`Seeded ${CITIES.length} cities, ${TYPES.length} types, 4 users, ${seedListings.length} listings.`);
  console.log("Sign in with any of:");
  console.log("  admin@meridian.test  / Password123");
  console.log("  agent@meridian.test  / Password123");
  console.log("  buyer@meridian.test  / Password123");
  void admin;
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
