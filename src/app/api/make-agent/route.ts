import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await prisma.user.update({
    where: {
      email: "ali@gmail.com",
    },
    data: {
      role: "AGENT",
    },
  });

  return NextResponse.json({
    message: "User is now an AGENT",
    user,
  });
}