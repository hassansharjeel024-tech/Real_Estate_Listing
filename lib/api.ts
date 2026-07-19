/**
 * Route-handler helpers: one response shape for the whole API, plus a
 * session guard that returns 401/403 JSON instead of redirecting.
 */
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import type { Role } from "@prisma/client";
import { getSession } from "@/lib/auth";
import type { SessionPayload } from "@/lib/jwt";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function fail(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ success: false, error: message, details }, { status });
}

/** Maps thrown errors onto the standard envelope. Never leaks stack traces. */
export function handleError(error: unknown) {
  if (error instanceof ZodError) {
    return fail("Validation failed", 422, error.flatten().fieldErrors);
  }
  if (error instanceof ApiError) {
    return fail(error.message, error.status);
  }
  console.error("[api]", error);
  return fail("Something went wrong on our end.", 500);
}

export class ApiError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

/** Throws ApiError(401/403) — pair with `handleError` in a try/catch. */
export async function authorize(...roles: Role[]): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new ApiError("You need to sign in first.", 401);
  if (roles.length && !roles.includes(session.role)) {
    throw new ApiError("You do not have access to this resource.", 403);
  }
  return session;
}
