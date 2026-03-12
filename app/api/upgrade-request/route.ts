// app/api/upgrade-requests/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const requestSchema = z.object({
  message: z.string().max(500).optional(),
});

// POST — guest submits an upgrade request
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "GUEST") {
      return NextResponse.json(
        { error: "Only GUEST accounts can request an upgrade" },
        { status: 400 },
      );
    }

    // Check for existing pending request
    const existing = await db.upgradeRequest.findUnique({
      where: { userId: session.user.id },
    });

    if (existing) {
      return NextResponse.json(
        {
          error: "You already have a pending upgrade request",
          status: existing.status,
        },
        { status: 409 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const parsed = requestSchema.safeParse(body);

    const request = await db.upgradeRequest.create({
      data: {
        id: crypto.randomUUID(),
        userId: session.user.id,
        message: parsed.success ? parsed.data.message : undefined,
      },
    });

    return NextResponse.json({ request }, { status: 201 });
  } catch (error) {
    console.error("[UPGRADE_REQUEST_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// GET — admin fetches all upgrade requests
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const requests = await db.upgradeRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        users: {
          select: { id: true, name: true, email: true, createdAt: true },
        },
      },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("[UPGRADE_LIST_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
