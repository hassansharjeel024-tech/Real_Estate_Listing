/**
 * POST /api/upload — multipart image upload to Vercel Blob.
 * Kept as a route handler (not a Server Action) so the same endpoint serves the
 * drag-and-drop uploader and any future mobile client.
 */
import type { NextRequest } from "next/server";
import { authorize, fail, handleError, ok } from "@/lib/api";
import { uploadImage } from "@/lib/blob";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    await authorize("AGENT", "ADMIN");
    const formData = await request.formData();
    const files = formData.getAll("files").filter((f): f is File => f instanceof File);

    if (files.length === 0) return fail("Attach at least one image.", 400);
    if (files.length > 10) return fail("Upload up to 10 images at a time.", 400);

    const uploaded = await Promise.all(files.map((file) => uploadImage(file)));
    return ok(uploaded, 201);
  } catch (error) {
    if (error instanceof Error && error.message.includes("images")) {
      return fail(error.message, 422);
    }
    return handleError(error);
  }
}
