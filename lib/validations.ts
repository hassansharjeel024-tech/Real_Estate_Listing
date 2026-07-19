/**
 * Zod schemas — the single source of truth for input shape.
 * Used by React Hook Form on the client and re-validated on the server, because
 * client validation is a UX feature, not a security control.
 */
import { z } from "zod";

export const roleEnum = z.enum(["ADMIN", "AGENT", "BUYER"]);

export const registerSchema = z
  .object({
    name: z.string().min(2, "Enter your full name.").max(80),
    email: z.string().email("Enter a valid email address."),
    phone: z.string().min(7, "Enter a valid phone number.").max(20).optional().or(z.literal("")),
    password: z
      .string()
      .min(8, "Use at least 8 characters.")
      .regex(/[A-Za-z]/, "Include at least one letter.")
      .regex(/[0-9]/, "Include at least one number."),
    confirmPassword: z.string(),
    // Admins are seeded, never self-registered.
    role: z.enum(["AGENT", "BUYER"]).default("BUYER"),
    company: z.string().max(80).optional().or(z.literal("")),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export const agentProfileSchema = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().max(20).optional().or(z.literal("")),
  company: z.string().max(80).optional().or(z.literal("")),
  licenseNo: z.string().max(40).optional().or(z.literal("")),
  whatsapp: z.string().max(20).optional().or(z.literal("")),
  bio: z.string().max(1000).optional().or(z.literal("")),
  photoUrl: z.string().url().optional().or(z.literal("")),
});

export const propertySchema = z.object({
  title: z.string().min(10, "Give the listing a descriptive title.").max(120),
  description: z.string().min(40, "Write at least 40 characters.").max(5000),
  price: z.coerce.number().int().positive("Price must be greater than zero."),
  typeId: z.string().min(1, "Choose a property type."),
  cityId: z.string().min(1, "Choose a city."),
  area: z.string().min(2, "Enter the area or neighbourhood.").max(80),
  address: z.string().min(5, "Enter the street address.").max(200),
  bedrooms: z.coerce.number().int().min(0).max(50),
  bathrooms: z.coerce.number().int().min(0).max(50),
  sizeSqft: z.coerce.number().int().positive("Enter the covered area in sq ft."),
  parking: z.coerce.number().int().min(0).max(20).default(0),
  furnished: z.boolean().default(false),
  amenities: z.array(z.string().max(40)).max(30).default([]),
  featuredImage: z.string().url().optional().or(z.literal("")),
  galleryImages: z.array(z.string().url()).max(20).default([]),
  availability: z.enum(["AVAILABLE", "UNDER_OFFER", "SOLD", "RENTED"]).default("AVAILABLE"),
});

/** Every field optional — used by PUT /api/properties/:id. */
export const propertyUpdateSchema = propertySchema.partial();

export const inquirySchema = z.object({
  propertyId: z.string().min(1),
  message: z.string().min(10, "Tell the agent what you would like to know.").max(1000),
  contactPreference: z.string().max(120).optional().or(z.literal("")),
});

/** Query string for GET /api/properties. Every field is optional. */
export const propertyFilterSchema = z.object({
  q: z.string().max(80).optional(),
  city: z.string().optional(),
  type: z.string().optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  bedrooms: z.coerce.number().int().min(0).max(50).optional(),
  bathrooms: z.coerce.number().int().min(0).max(50).optional(),
  minSize: z.coerce.number().int().min(0).optional(),
  maxSize: z.coerce.number().int().min(0).optional(),
  featured: z.enum(["true", "false"]).optional(),
  sort: z.enum(["latest", "price_asc", "price_desc", "size_desc"]).default("latest"),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(48).default(12),
});

export const moderationSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "PENDING"]),
  rejectionNote: z.string().max(300).optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: z
      .string()
      .min(8, "Use at least 8 characters.")
      .regex(/[A-Za-z]/, "Include at least one letter.")
      .regex(/[0-9]/, "Include at least one number."),
    confirmNewPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, {
    message: "Passwords do not match.",
    path: ["confirmNewPassword"],
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: "New password must be different from your current one.",
    path: ["newPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PropertyInput = z.infer<typeof propertySchema>;
export type InquiryInput = z.infer<typeof inquirySchema>;
export type PropertyFilter = z.infer<typeof propertyFilterSchema>;
export type AgentProfileInput = z.infer<typeof agentProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
