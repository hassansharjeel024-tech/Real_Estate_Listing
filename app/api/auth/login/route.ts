/** POST /api/auth/login */
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, verifyPassword } from "@/lib/auth";
import { ApiError, handleError, ok } from "@/lib/api";
import { loginSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = loginSchema.parse(await request.json());
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    // Same message for "no such user" and "wrong password" — revealing which
    // one failed lets an attacker enumerate registered emails.
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw new ApiError("Email or password is incorrect.", 401);
    }
    if (!user.isActive) {
      throw new ApiError("This account has been deactivated. Contact support.", 403);
    }

    await createSession({ userId: user.id, email: user.email, role: user.role });
    return ok({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (error) {
    return handleError(error);
  }
}
