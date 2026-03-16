// components/Navbar.tsx  ← stays a Server Component
import { auth } from "@/lib/auth";
import NavbarClient from "@/components/NavbarClient";
import { db } from "@/lib/db";

export default async function Navbar() {
  const session = await auth();
  const role = session?.user?.role as string | undefined;

  let imageUrl = "";
  let badges = {
    inquiries: 0, // wholesaler: their open inquiries / admin: all open inquiries
    orders: 0, // admin: pending orders
    upgradeRequests: 0, // admin: pending upgrade requests
  };

  if (session?.user?.id) {
    // Always fetch fresh imageUrl from DB
    const user = await db.users.findUnique({
      where: { id: session.user.id },
      select: { imageUrl: true },
    });
    imageUrl = user?.imageUrl ?? "";

    if (role === "WHOLESALER") {
      const [inquiries, orders] = await Promise.all([
        db.inquiries.count({
          where: { wholesalerId: session.user.id, status: "OPEN" },
        }),
        db.orders.count({
          where: { userId: session.user.id, status: "PENDING" },
        }),
      ]);

      badges = { inquiries, orders, upgradeRequests: 0 };
      // Count this wholesaler's OPEN inquiries
    }

    if (role === "ADMIN") {
      // Count all open inquiries
      const [inquiries, orders, upgradeRequests] = await Promise.all([
        db.inquiries.count({ where: { status: "OPEN" } }),
        db.orders.count({ where: { status: "PENDING" } }),
        db.upgradeRequest.count({ where: { status: "PENDING" } }),
      ]);
      badges = { inquiries, orders, upgradeRequests };
    }
  }

  return <NavbarClient session={session} imageUrl={imageUrl} badges={badges} />;
}
