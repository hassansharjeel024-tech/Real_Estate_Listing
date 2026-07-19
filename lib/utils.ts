import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 12500000 -> "PKR 1.25 Cr". Listings are priced in whole rupees. */
export function formatPrice(value: number) {
  if (value >= 10_000_000) return `PKR ${(value / 10_000_000).toFixed(2).replace(/\.00$/, "")} Cr`;
  if (value >= 100_000) return `PKR ${(value / 100_000).toFixed(2).replace(/\.00$/, "")} Lac`;
  return `PKR ${value.toLocaleString("en-PK")}`;
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 70);
}

/** Appends a short random suffix so two "3 Bed House" listings never collide. */
export function uniqueSlug(title: string) {
  return `${slugify(title)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}
