/** GET /api/admin/dashboard — aggregate counts for the admin overview. */
import { authorize, handleError, ok } from "@/lib/api";
import { getAdminStats } from "@/lib/queries";

export async function GET() {
  try {
    await authorize("ADMIN");
    return ok(await getAdminStats());
  } catch (error) {
    return handleError(error);
  }
}
