// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    console.log("[REGISTER]", { name, email });
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    const existingUser = await db.users.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await db.users.create({
      data: {
        id: crypto.randomUUID(),
        name,
        email,
        password: hashedPassword,
        role: "WHOLESALER",
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(
      { message: "Account created", userId: user.id },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error("[REGISTER_ERROR]", error.message);
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
