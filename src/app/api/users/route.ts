import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Get Authorization header
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    // Verify JWT
    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json(
        { message: "Invalid Token" },
        { status: 401 }
      );
    }

    // Allow only ADMIN
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Access Denied" },
        { status: 403 }
      );
    }

    // Fetch users
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error.message,
      },
      { status: 500 }
    );
  }
}