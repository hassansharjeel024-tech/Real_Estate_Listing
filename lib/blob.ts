/**
 * Vercel Blob wrapper. Kept in one place so validation rules (type, size) are
 * enforced identically for featured images and gallery uploads.
 */
import "server-only";
import { put, del } from "@vercel/blob";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export async function uploadImage(file: File, folder = "properties") {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Only JPEG, PNG, WebP and AVIF images are accepted.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Images must be 5 MB or smaller.");
  }
  // `addRandomSuffix` prevents one upload overwriting another with the same name.
  const blob = await put(`${folder}/${file.name}`, file, {
    access: "public",
    addRandomSuffix: true,
  });
  return { url: blob.url, blobPath: blob.pathname };
}

/** Deleting a blob must never break the request that removed the DB row. */
export async function deleteImage(url: string) {
  try {
    await del(url);
  } catch (error) {
    console.error("[blob] delete failed", url, error);
  }
}
