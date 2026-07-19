/** GET /api/auth/me — current user, or null when signed out. */
import { getCurrentUser } from "@/lib/auth";
import { handleError, ok } from "@/lib/api";

export async function GET() {
  try {
    return ok(await getCurrentUser());
  } catch (error) {
    return handleError(error);
  }
}
