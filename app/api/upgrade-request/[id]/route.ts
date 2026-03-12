// app/api/upgrade-requests/[id]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const actionSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = actionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "action must be APPROVE or REJECT" },
        { status: 400 },
      );
    }

    const { action } = parsed.data;

    const upgradeRequest = await db.upgradeRequest.findUnique({
      where: { id: params.id },
      include: { users: { select: { id: true } } },
    });

    if (!upgradeRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (upgradeRequest.status !== "PENDING") {
      return NextResponse.json(
        { error: "This request has already been processed" },
        { status: 400 },
      );
    }

    // Run both updates in a transaction
    await db.$transaction(async (tx) => {
      await tx.upgradeRequest.update({
        where: { id: params.id },
        data: {
          status: action === "APPROVE" ? "APPROVED" : "REJECTED",
          updatedAt: new Date(),
        },
      });

      if (action === "APPROVE") {
        await tx.users.update({
          where: { id: upgradeRequest.users.id },
          data: { role: "WHOLESALER", updatedAt: new Date() },
        });
      }
    });

    return NextResponse.json({
      message:
        action === "APPROVE"
          ? "User upgraded to WHOLESALER"
          : "Request rejected",
    });
  } catch (error) {
    console.error("[UPGRADE_ACTION_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
