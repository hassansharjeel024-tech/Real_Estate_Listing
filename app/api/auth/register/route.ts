/** POST /api/auth/register — creates a BUYER or AGENT and signs them in. */
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword } from "@/lib/auth";
import { ApiError, handleError, ok } from "@/lib/api";
import { registerSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = registerSchema.parse(await request.json());
    const email = body.email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new ApiError("That email is already registered.", 409);

    const user = await prisma.user.create({
      data: {
        email,
        name: body.name,
        phone: body.phone || null,
        role: body.role,
        passwordHash: await hashPassword(body.password),
        // The matching profile row is created in the same transaction as the
        // user, so a User can never exist without its profile.
        ...(body.role === "AGENT"
          ? { agentProfile: { create: { company: body.company || null } } }
          : { buyerProfile: { create: {} } }),
      },
      select: { id: true, email: true, name: true, role: true },
    });

    await createSession({ userId: user.id, email: user.email, role: user.role });
    return ok(user, 201);
  } catch (error) {
    return handleError(error);
  }
}
