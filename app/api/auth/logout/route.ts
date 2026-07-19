/** POST /api/auth/logout — clears the session cookie. */
import { destroySession } from "@/lib/auth";
import { handleError, ok } from "@/lib/api";

export async function POST() {
  try {
    await destroySession();
    return ok({ loggedOut: true });
  } catch (error) {
    return handleError(error);
  }
}
