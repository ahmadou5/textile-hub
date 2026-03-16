// components/Navbar.tsx  ← stays a Server Component
import { auth } from "@/lib/auth";
import NavbarClient from "@/components/NavbarClient";
import { db } from "@/lib/db";

export default async function Navbar() {
  const session = await auth();
  const user = await db.users.findUnique({
    where: { id: session?.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      imageUrl: true,
      createdAt: true,
      upgradeRequest: {
        select: { id: true, status: true, message: true, createdAt: true },
      },
    },
  });
  return <NavbarClient session={session} imageUrl={user?.imageUrl || ""} />;
}
